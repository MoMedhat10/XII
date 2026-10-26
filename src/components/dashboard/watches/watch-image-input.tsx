"use client"

import type { Ref } from "react"

import { WATCH_IMAGE_TYPES } from "@/app/(dashboard)/_utils/upload-rules"

export function WatchImageInput({
  ref,
  onFiles,
}: {
  ref: Ref<HTMLInputElement>
  onFiles: (files: FileList | null) => void
}) {
  return (
    <input
      ref={ref}
      type="file"
      multiple
      accept={WATCH_IMAGE_TYPES.join(",")}
      aria-hidden="true"
      tabIndex={-1}
      className="hidden"
      onChange={(event) => {
        onFiles(event.target.files)
        event.target.value = "" // so picking the same file again still fires
      }}
    />
  )
}
