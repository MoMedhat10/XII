export function putWithProgress(url: string, file: File, onProgress?: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url)
    xhr.setRequestHeader("Content-Type", file.type) // must equal the signed ContentType
    xhr.setRequestHeader("Cache-Control", "public, max-age=31536000, immutable") // also signed
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100))
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status}).`)))
    xhr.onerror = () => reject(new Error("Network error during upload."))
    xhr.send(file)
  })
}