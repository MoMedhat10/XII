import { createWatchImageUpload } from "../actions/watches"
import { putWithProgress } from "@/lib/upload-client"

/** Uploads one image to tmp storage and returns its key for createWatch. */
export async function uploadWatchImage(
  file: File,
  onProgress?: (pct: number) => void
) {
  const signed = await createWatchImageUpload({
    contentType: file.type,
    size: file.size,
  })
  if (!signed.success) throw new Error(signed.message)
  await putWithProgress(signed.data.url, file, onProgress)
  return signed.data.key
}
