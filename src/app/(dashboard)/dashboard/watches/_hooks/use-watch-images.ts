"use client"

import { useState } from "react"
import { toast } from "sonner"

import type { DeleteTarget } from "./types"

import type { AdminWatch, AdminWatchImage } from "../_data/types"
import { MAX_WATCH_IMAGES } from "../_utils/upload-rules"
import { watchImageFileSchema } from "../_utils/watch-schema"
import { uploadWatchImage } from "../_utils/watch-upload"
import { errorMessage } from "../../../_utils/action-client"
import {
  useAddWatchImages,
  useDeleteWatchImage,
  useSetCover,
} from "./admin-mutations"
import type { WatchList } from "./use-watch-list"

type ImageTarget = Extract<DeleteTarget, { kind: "image" }>

export function useWatchImages({ list }: { list: WatchList }) {
  // State, not refs: the component reads this hook's result during render,
  // and the React Compiler lint forbids passing refs around that way.
  /** the hidden file input shared by every row's "+" tile (set by a callback ref) */
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null)
  const [uploadTarget, setUploadTarget] = useState<string | null>(null)

  const addImages = useAddWatchImages()
  const cover = useSetCover()
  const deleteImage = useDeleteWatchImage()

  const pick = (watch: AdminWatch) => {
    if (list.imageBusyIds.has(watch.id)) return
    setUploadTarget(watch.id)
    // the dialog's change event arrives after the re-render, so
    // onFilesPicked already sees the new target
    fileInput?.click()
  }

  const upload = async (watchId: string, fileList: FileList | null) => {
    const watch = list.watches.find((w) => w.id === watchId)
    if (!watch || !fileList?.length || list.imageBusyIds.has(watchId)) return

    const room = MAX_WATCH_IMAGES - watch.images.length
    const files = Array.from(fileList)
    if (files.length > room) {
      toast.error(
        `Only ${room} more image${room === 1 ? "" : "s"} can be added.`
      )
    }

    const drafts: { image: AdminWatchImage; file: File }[] = []
    for (const file of files.slice(0, room)) {
      const result = watchImageFileSchema.safeParse(file)
      if (!result.success) {
        toast.error(`${file.name}: ${result.error.issues[0]?.message}`)
        continue
      }
      drafts.push({
        file,
        image: {
          id: `upload-${crypto.randomUUID()}`,
          url: URL.createObjectURL(file),
          alt: `${watch.name}, view ${watch.images.length + drafts.length + 1}`,
          progress: 0,
        },
      })
    }
    if (!drafts.length) return

    const tileIds = new Set(drafts.map((d) => d.image.id))
    const finish = () => {
      list.dropUploads(watchId, tileIds)
      list.setUploading(watchId, false)
      drafts.forEach((d) => URL.revokeObjectURL(d.image.url))
    }

    list.addUploads(
      watchId,
      drafts.map((d) => d.image)
    )
    list.setUploading(watchId, true)

    const results = await Promise.allSettled(
      drafts.map((d) =>
        uploadWatchImage(d.file, (pct) =>
          // held at 99 until the server has saved it
          list.setUploadProgress(watchId, d.image.id, Math.min(pct, 99))
        )
      )
    )
    const imageKeys: string[] = []
    results.forEach((result, i) => {
      if (result.status === "fulfilled") imageKeys.push(result.value)
      else
        toast.error(
          `${drafts[i].file.name}: ${errorMessage(result.reason, "Upload failed.")}`
        )
    })

    try {
      if (imageKeys.length) {
        // mutateAsync, not mutate: each upload needs its own "done" signal,
        // and mutate's per-call callbacks only fire for the latest call
        await addImages.mutateAsync({
          watchId,
          watchName: watch.name,
          imageKeys,
        })
      }
    } catch {
      // the mutation's onError already showed the toast
    } finally {
      // the action's images were written into the cache first, so the
      // tiles are swapped for the real images with no gap
      finish()
    }
  }

  const onFilesPicked = (files: FileList | null) => {
    if (uploadTarget) void upload(uploadTarget, files)
  }

  const setCover = (watch: AdminWatch, imageId: string) => {
    const image = watch.images.find((i) => i.id === imageId)
    if (!image || list.imageBusyIds.has(watch.id)) return
    cover.mutate({
      watchId: watch.id,
      watchName: watch.name,
      imageIds: [image, ...watch.images.filter((i) => i !== image)].map(
        (i) => i.id
      ),
    })
  }

  const deleteTarget = (
    watch: AdminWatch,
    image: AdminWatchImage
  ): ImageTarget => {
    const index = watch.images.findIndex((i) => i.id === image.id)
    return {
      kind: "image",
      id: image.id,
      name: watch.name,
      watchId: watch.id,
      url: image.url,
      position: index + 1,
      isCover: index === 0 && watch.images.length > 1,
      isLastOfLive: watch.isActive && watch.images.length === 1,
    }
  }

  /** Run by the delete confirmation. */
  const remove = async (target: ImageTarget) => {
    const res = await deleteImage.mutateAsync({
      id: target.id,
      watchId: target.watchId,
    })
    return `${res.message} · ${target.name}`
  }

  return {
    setFileInput,
    pick,
    onFilesPicked,
    setCover,
    deleteTarget,
    remove,
  }
}
