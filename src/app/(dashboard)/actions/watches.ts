"use server"

import { revalidatePath } from "next/cache"
import { Prisma } from "@/app/generated/prisma/client"
import prisma from "../../../../lib/prisma"
import { logger } from "../../../../lib/pino"
import {
  createPresignedPut,
  deleteObjects,
  moveObject,
} from "../../../../lib/storage"
import { requireAdmin } from "../_utils/require-admin"
import { verifyUploadedImage } from "../_utils/verify-upload"
import {
  MAX_WATCH_IMAGE_BYTES,
  MAX_WATCH_IMAGES,
  WATCH_IMAGE_EXT,
  WATCH_IMAGE_TYPES,
} from "../_utils/upload-rules"
import {
  addWatchImagesSchema,
  createWatchSchema,
  deleteWatchImageSchema,
  deleteWatchSchema,
  parsePriceInput,
  reorderWatchImagesSchema,
  setWatchActiveSchema,
  updateWatchSchema,
  watchImageUploadSchema,
  type AddWatchImagesInput,
  type CreateWatchInput,
  type DeleteWatchImageInput,
  type DeleteWatchInput,
  type ReorderWatchImagesInput,
  type SetWatchActiveInput,
  type UpdateWatchInput,
} from "../_utils/watch-schema"
import { fail, type ActionRes } from "../_utils/action-result"
import {
  getAdminWatchImages,
  toAdminWatch,
  watchSelect,
} from "../_data/watches"
import type { AdminWatch, AdminWatchImage } from "../_data/types"

const PATH = "/dashboard/watches"
const WATCH_GONE = "This watch no longer exists."
const IMAGES_CHANGED = "Images changed, please refresh and try again."
const HAS_ORDERS =
  "This watch has orders and can't be deleted. Unpublish it instead."

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function removeObjects(keys: string[]) {
  await deleteObjects(keys).catch((error) =>
    logger.warn({ error, keys }, "image delete failed")
  )
}

/**
 * Locks the watch row until the transaction ends, so image counts read
 * afterwards can't change underneath us (two deletes, delete vs publish, …).
 * Returns false when the watch doesn't exist.
 */
async function lockWatch(tx: Prisma.TransactionClient, id: string) {
  const rows = await tx.$queryRaw<{ id: string }[]>`
    SELECT id FROM "Watch" WHERE id = ${id} FOR UPDATE`
  return rows.length > 0
}

/** Ends a transaction early with a message for the admin. */
class ActionError extends Error {}

/**
 * Verifies every tmp upload, then moves them to watches/<watchId>/.
 * All or nothing: on any failure every file is removed and null is returned.
 */
async function promoteImages(watchId: string, tmpKeys: string[]) {
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
    key: tmpKey.replace(/^tmp\/watches\//, `watches/${watchId}/`), // tmp/watches/x.png → watches/<id>/x.png
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

function actionFail(
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

// ---------------------------------------------------------------------------
// Watches
// ---------------------------------------------------------------------------

/** Always created as a draft with no images. */
export async function createWatch(
  input: CreateWatchInput
): Promise<ActionRes<AdminWatch>> {
  await requireAdmin()
  const parsed = createWatchSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { price, ...fields } = parsed.data

  try {
    const watch = await prisma.watch.create({
      // isActive left to the DB default (false): publishing is a separate step
      data: { ...fields, priceCents: parsePriceInput(price) * 100 },
      select: watchSelect,
    })
    revalidatePath(PATH)
    return {
      success: true,
      message: "Draft created",
      data: toAdminWatch(watch),
    }
  } catch (error) {
    return actionFail(error, "createWatch", {
      P2003: "This brand no longer exists.",
    })
  }
}

/**
 * Saves the drawer's fields. Fails if someone else saved the watch since it
 * was opened, rather than silently overwriting their changes.
 */
export async function updateWatch(
  input: UpdateWatchInput
): Promise<ActionRes<AdminWatch>> {
  await requireAdmin()
  const parsed = updateWatchSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { id, updatedAt, price, ...fields } = parsed.data

  try {
    const watch = await prisma.$transaction(async (tx) => {
      if (!(await lockWatch(tx, id))) throw new ActionError(WATCH_GONE)
      const current = await tx.watch.findUniqueOrThrow({
        where: { id },
        select: { name: true, updatedAt: true },
      })
      if (current.updatedAt.getTime() !== new Date(updatedAt).getTime()) {
        throw new ActionError(
          "Someone else changed this watch. Close and reopen it to see the latest."
        )
      }

      await tx.watch.update({
        where: { id },
        data: { ...fields, priceCents: parsePriceInput(price) * 100 },
      })

      // keep alt text in step with the name ("<name>, view N")
      if (current.name !== fields.name) {
        const images = await tx.watchImage.findMany({
          where: { watchId: id },
          select: { id: true },
          orderBy: { sortOrder: "asc" },
        })
        for (const [i, image] of images.entries()) {
          await tx.watchImage.update({
            where: { id: image.id },
            data: { alt: `${fields.name}, view ${i + 1}` },
          })
        }
      }

      return tx.watch.findUniqueOrThrow({ where: { id }, select: watchSelect })
    })
    revalidatePath(PATH)
    return { success: true, message: "Saved", data: toAdminWatch(watch) }
  } catch (error) {
    return actionFail(error, "updateWatch", {
      P2003: "This brand no longer exists.",
    })
  }
}

/** Publishing needs at least one image; unpublishing always works. */
export async function setWatchActive(
  input: SetWatchActiveInput
): Promise<ActionRes<{ isActive: boolean }>> {
  await requireAdmin()
  const parsed = setWatchActiveSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { id, isActive } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      if (!(await lockWatch(tx, id))) throw new ActionError(WATCH_GONE)
      if (
        isActive &&
        (await tx.watchImage.count({ where: { watchId: id } })) === 0
      ) {
        throw new ActionError("Add at least one image before publishing.")
      }
      await tx.watch.update({ where: { id }, data: { isActive } })
    })
    revalidatePath(PATH)
    return {
      success: true,
      message: isActive ? "Live" : "Hidden",
      data: { isActive },
    }
  } catch (error) {
    return actionFail(error, "setWatchActive")
  }
}

/** Deletes the watch, its image rows (cascade) and its image files. */
export async function deleteWatch(
  input: DeleteWatchInput
): Promise<ActionRes<{ id: string; brandId: string }>> {
  await requireAdmin()
  const parsed = deleteWatchSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { id } = parsed.data

  try {
    const deleted = await prisma.$transaction(async (tx) => {
      if (!(await lockWatch(tx, id))) throw new ActionError(WATCH_GONE)
      const watch = await tx.watch.findUniqueOrThrow({
        where: { id },
        select: {
          brandId: true,
          images: { select: { key: true } },
          _count: { select: { orderItems: true } },
        },
      })
      // OrderItem → Watch has no cascade: sold watches stay for order history
      if (watch._count.orderItems > 0) throw new ActionError(HAS_ORDERS)
      await tx.watch.delete({ where: { id } }) // images, favorites, cart items cascade
      return watch
    })

    // the rows are gone, so the files are unreferenced and safe to delete
    await removeObjects(deleted.images.map((image) => image.key))
    revalidatePath(PATH)
    return {
      success: true,
      message: "Deleted",
      data: { id, brandId: deleted.brandId },
    }
  } catch (error) {
    return actionFail(error, "deleteWatch", { P2003: HAS_ORDERS })
  }
}

// ---------------------------------------------------------------------------
// Watch images
// ---------------------------------------------------------------------------

/** Permission to upload one image to tmp storage. */
export async function createWatchImageUpload(input: {
  contentType: string
  size: number
}): Promise<ActionRes<{ key: string; url: string }>> {
  await requireAdmin()
  const parsed = watchImageUploadSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)

  const key = `tmp/watches/${crypto.randomUUID()}.${WATCH_IMAGE_EXT[parsed.data.contentType]}`
  const url = await createPresignedPut(key, parsed.data.contentType)
  return { success: true, message: "OK", data: { key, url } }
}

/** Attaches uploaded tmp images to a watch, after its current ones. */
export async function addWatchImages(
  input: AddWatchImagesInput
): Promise<ActionRes<AdminWatchImage[]>> {
  await requireAdmin()
  const parsed = addWatchImagesSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { watchId, imageKeys } = parsed.data

  const watch = await prisma.watch.findUnique({
    where: { id: watchId },
    select: { name: true },
  })
  if (!watch) {
    await removeObjects(imageKeys)
    return fail(WATCH_GONE)
  }

  const images = await promoteImages(watchId, imageKeys)
  if (!images) return fail("An image upload is missing or isn't a valid image.")

  try {
    await prisma.$transaction(async (tx) => {
      if (!(await lockWatch(tx, watchId))) throw new ActionError(WATCH_GONE)
      const current = await tx.watchImage.aggregate({
        where: { watchId },
        _count: true,
        _max: { sortOrder: true },
      })
      const room = MAX_WATCH_IMAGES - current._count
      if (images.length > room) {
        throw new ActionError(
          room > 0
            ? `Only ${room} more image${room === 1 ? "" : "s"} can be added.`
            : `This watch already has ${MAX_WATCH_IMAGES} images.`
        )
      }
      const start = (current._max.sortOrder ?? -1) + 1
      await tx.watchImage.createMany({
        data: images.map((image, i) => ({
          watchId,
          key: image.key,
          alt: `${watch.name}, view ${current._count + i + 1}`,
          sizeBytes: image.sizeBytes,
          contentType: image.contentType,
          sortOrder: start + i,
        })),
      })
    })
  } catch (error) {
    await removeObjects(images.map((image) => image.key)) // don't leave files behind if the rows failed
    return actionFail(error, "addWatchImages")
  }

  // committed: from here on the files belong to saved rows, so never delete them
  revalidatePath(PATH)
  const count = images.length
  try {
    return {
      success: true,
      message: `${count} image${count === 1 ? "" : "s"} added`,
      data: await getAdminWatchImages(watchId),
    }
  } catch (error) {
    return actionFail(error, "addWatchImages (reload)")
  }
}

/**
 * Deletes one image. Deleting the last image of a live watch also
 * unpublishes it, so a published watch always has a photo.
 */
export async function deleteWatchImage(
  input: DeleteWatchImageInput
): Promise<
  ActionRes<{ imageId: string; isActive: boolean; unpublished: boolean }>
> {
  await requireAdmin()
  const parsed = deleteWatchImageSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { id } = parsed.data

  const image = await prisma.watchImage.findUnique({
    where: { id },
    select: { watchId: true },
  })
  if (!image) return fail("This image no longer exists.")

  try {
    const result = await prisma.$transaction(async (tx) => {
      if (!(await lockWatch(tx, image.watchId)))
        throw new ActionError(WATCH_GONE)
      // re-read under the lock: it may have been deleted meanwhile
      const row = await tx.watchImage.findUnique({
        where: { id },
        select: { key: true },
      })
      if (!row) throw new ActionError("This image no longer exists.")
      await tx.watchImage.delete({ where: { id } })

      const left = await tx.watchImage.count({
        where: { watchId: image.watchId },
      })
      const watch = await tx.watch.findUniqueOrThrow({
        where: { id: image.watchId },
        select: { isActive: true },
      })
      const unpublished = watch.isActive && left === 0
      if (unpublished) {
        await tx.watch.update({
          where: { id: image.watchId },
          data: { isActive: false },
        })
      }
      return {
        key: row.key,
        isActive: watch.isActive && !unpublished,
        unpublished,
      }
    })

    // committed: the file is unreferenced now
    await removeObjects([result.key])
    revalidatePath(PATH)
    return {
      success: true,
      message: result.unpublished
        ? "Image deleted, watch moved to drafts"
        : "Image deleted",
      data: {
        imageId: id,
        isActive: result.isActive,
        unpublished: result.unpublished,
      },
    }
  } catch (error) {
    return actionFail(error, "deleteWatchImage")
  }
}

/** Saves a new image order. The first image is the cover. */
export async function reorderWatchImages(
  input: ReorderWatchImagesInput
): Promise<ActionRes<AdminWatchImage[]>> {
  await requireAdmin()
  const parsed = reorderWatchImagesSchema.safeParse(input)
  if (!parsed.success) return fail(parsed.error.issues[0].message)
  const { watchId, imageIds } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      if (!(await lockWatch(tx, watchId))) throw new ActionError(WATCH_GONE)
      const current = await tx.watchImage.findMany({
        where: { watchId },
        select: { id: true },
      })
      const same =
        current.length === imageIds.length &&
        current.every((image) => imageIds.includes(image.id))
      if (!same) throw new ActionError(IMAGES_CHANGED)

      // two passes so @@unique([watchId, sortOrder]) never sees a duplicate
      for (const [i, id] of imageIds.entries()) {
        await tx.watchImage.update({
          where: { id },
          data: { sortOrder: -(i + 1) },
        })
      }
      for (const [i, id] of imageIds.entries()) {
        await tx.watchImage.update({ where: { id }, data: { sortOrder: i } })
      }
    })
    revalidatePath(PATH)
    return {
      success: true,
      message: "Cover updated",
      data: await getAdminWatchImages(watchId),
    }
  } catch (error) {
    return actionFail(error, "reorderWatchImages")
  }
}
