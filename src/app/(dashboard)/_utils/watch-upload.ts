import { createWatchImageUpload } from "../actions/watch-images"
import { putWithProgress } from "@/lib/upload-client"

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
