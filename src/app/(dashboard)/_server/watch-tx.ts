import "server-only"
import { Prisma } from "@/app/generated/prisma/client"
import { logger } from "../../../../lib/pino"
import { deleteObjects, moveObject } from "../../../../lib/storage"
import { verifyUploadedImage } from "./verify-upload"
import {
  MAX_WATCH_IMAGE_BYTES,
  WATCH_IMAGE_TYPES,
} from "../_utils/upload-rules"
import { fail } from "../_utils/action-result"

export const PATH = "/dashboard/watches"
export const WATCH_GONE = "This watch no longer exists."
export const IMAGES_CHANGED = "Images changed, please refresh and try again."
export const HAS_ORDERS =
  "This watch has orders and can't be deleted. Unpublish it instead."

export async function removeObjects(keys: string[]) {
  await deleteObjects(keys).catch((error) =>
    logger.warn({ error, keys }, "image delete failed")
  )
}

/**
 * Locks the watch row until the transaction ends, so image counts read
 * afterwards can't change underneath us (two deletes, delete vs publish, …).
 * Returns false when the watch doesn't exist.
 */
export async function lockWatch(tx: Prisma.TransactionClient, id: string) {
  const rows = await tx.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Watch" WHERE id = ${id} FOR UPDATE`
  return rows.length > 0
}

export class ActionError extends Error {}

/**
 * Verifies every tmp upload, then moves them to watches/<watchId>/.
 * All or nothing: on any failure every file is removed and null is returned.
 */
export async function promoteImages(watchId: string, tmpKeys: string[]) {
  const checks = await Promise.all(
    tmpKeys.map((key) =>
      verifyUploadedImage(key, {
        maxBytes: MAX_WATCH_IMAGE_BYTES,
        allowed: WATCH_IMAGE_TYPES,
      })
    )
  )
  if (checks.some((check) => !check)) {
    // invalid files were already deleted by the check; drop the valid ones too
    await removeObjects(tmpKeys.filter((_, i) => checks[i]))
    return null
  }

  const images = tmpKeys.map((tmpKey, i) => ({
    tmpKey,
    key: tmpKey.replace(/^tmp\/watches\//, `watches/${watchId}/`),
    ...checks[i]!,
  }))

  const moves = await Promise.allSettled(
    images.map((image) => moveObject(image.tmpKey, image.key))
  )
  if (moves.some((move) => move.status === "rejected")) {
    logger.error({ moves, watchId }, "moving watch images failed")
    await removeObjects(images.flatMap((image) => [image.tmpKey, image.key]))
    return null
  }
  return images
}

export function actionFail(
  error: unknown,
  where: string,
  messages: Partial<Record<"P2002" | "P2003" | "P2025", string>> = {}
) {
  if (error instanceof ActionError) return fail(error.message)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const code = error.code as keyof typeof messages
    const defaults = { P2002: IMAGES_CHANGED, P2025: WATCH_GONE }
    const message = messages[code] ?? defaults[code as keyof typeof defaults]
    if (message) return fail(message)
  }
  logger.error(error, `${where} failed`)
  return fail("Something went wrong. Please try again.")
}
