"use client"

import { startTransition, useState } from "react"
import { toast } from "sonner"

import type { DeleteTarget } from "@/components/dashboard/watches/confirm-delete-dialog"

import type { AdminWatch, AdminWatchImage } from "../_data/types"
import { MAX_WATCH_IMAGES } from "../_utils/upload-rules"
import { watchImageFileSchema } from "../_utils/watch-schema"
import { uploadWatchImage } from "../_utils/watch-upload"
import { errorMessage } from "../_utils/watches-client"
import {
  addWatchImages,
  deleteWatchImage,
  reorderWatchImages,
} from "../actions/watches"
import type { WatchList } from "./use-watch-list"

type ImageTarget = Extract<DeleteTarget, { kind: "image" }>

export function useWatchImages({ list }: { list: WatchList }) {
  // State, not refs: the component reads this hook's result during render,
  // and the React Compiler lint forbids passing refs around that way.
  /** the hidden file input shared by every row's "+" tile (set by a callback ref) */
  const [fileInput, setFileInput] = useState<HTMLInputElement | null>(null)
  const [uploadTarget, setUploadTarget] = useState<string | null>(null)

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
      list.setImageBusy(watchId, false)
      drafts.forEach((d) => URL.revokeObjectURL(d.image.url))
    }

    list.addUploads(
      watchId,
      drafts.map((d) => d.image)
    )
    list.setImageBusy(watchId, true)

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
    if (!imageKeys.length) return finish()

    startTransition(async () => {
      try {
        const res = await addWatchImages({ watchId, imageKeys })
        if (!res.success) throw new Error(res.message)
        toast.success(`${res.message} · ${watch.name}`)
      } catch (error) {
        toast.error(errorMessage(error, "Couldn't add the images."))
      }
      // the tiles leave in the same commit as the refreshed row's images
      startTransition(finish)
    })
  }

  const onFilesPicked = (files: FileList | null) => {
    if (uploadTarget) upload(uploadTarget, files)
  }

  const setCover = (watch: AdminWatch, imageId: string) => {
    const image = watch.images.find((i) => i.id === imageId)
    if (!image || list.imageBusyIds.has(watch.id)) return
    const order = [image, ...watch.images.filter((i) => i !== image)]

    list.setImageBusy(watch.id, true)
    startTransition(async () => {
      list.applyOptimistic({ type: "cover", id: watch.id, imageId })
      try {
        const res = await reorderWatchImages({
          watchId: watch.id,
          imageIds: order.map((i) => i.id),
        })
        if (!res.success) throw new Error(res.message)
        toast.success(`${res.message} · ${watch.name}`)
      } catch (error) {
        // no manual undo: the optimistic order drops when this ends
        toast.error(errorMessage(error, "Couldn't change the cover."))
      }
      startTransition(() => list.setImageBusy(watch.id, false))
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

  /** Run by the delete confirmation. The last image of a live watch also unpublishes it (server decides). */
  const remove = async (target: ImageTarget) => {
    // the refresh brings the row without the image (and unpublished if it
    // was the last one)
    const res = await deleteWatchImage({ id: target.id })
    if (!res.success) throw new Error(res.message)
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
