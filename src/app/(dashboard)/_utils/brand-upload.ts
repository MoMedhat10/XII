import { createBrandLogoUpload } from "../actions/brands"
import { putWithProgress } from "@/lib/upload-client"


export async function uploadBrandLogo(file: File) {
  const signed = await createBrandLogoUpload({ contentType: file.type, size: file.size })
  if (!signed.success) throw new Error(signed.message)
  await putWithProgress(signed.data.url, file)
  return signed.data.key
}