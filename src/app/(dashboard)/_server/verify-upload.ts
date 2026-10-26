import "server-only"
import { headObject, readFirstBytes, deleteObjects } from "../../../../lib/storage"
import { logger } from "../../../../lib/pino"

function sniffImageType(b: Buffer): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg"
  if (b[0] === 0x89 && b.toString("ascii", 1, 4) === "PNG") return "image/png"
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "image/webp"
  if (b.toString("ascii", 4, 8) === "ftyp" && ["avif", "avis"].includes(b.toString("ascii", 8, 12))) return "image/avif"
  return null
}

export async function verifyUploadedImage(
  key: string,
  { maxBytes, allowed }: { maxBytes: number; allowed: readonly string[] },
) {
  try {
    const head = await headObject(key)
    const sizeBytes = head.ContentLength ?? 0
    const contentType = sniffImageType(await readFirstBytes(key))

    if (!contentType || !allowed.includes(contentType) || sizeBytes === 0 || sizeBytes > maxBytes) {
      await deleteObjects([key])
      return null
    }
    return { sizeBytes, contentType }
  } catch (error) {
    // NotFound means the browser never uploaded; anything else is likely a storage/config problem
    const notFound = error instanceof Error && error.name === "NotFound"
    if (notFound) logger.warn({ key }, "uploaded image not found")
    else logger.error({ error, key }, "verifying uploaded image failed")
    return null
  }
}