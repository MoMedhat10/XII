"use client"

import { useState } from "react"
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
          id: `upload-${crypto.randomUUID()}`, // replaced by the server's id
          url: URL.createObjectURL(file),
          alt: `${watch.name}, view ${watch.images.length + drafts.length + 1}`,
          progress: 0,
        },
      })
    }
    if (!drafts.length) return

    const draftIds = new Set(drafts.map((d) => d.image.id))
    const setProgress = (imageId: string, pct: number) =>
      list.patchWatch(watchId, (w) => ({
        ...w,
        images: w.images.map((image) =>
          // held at 99 until the server has saved it
          image.id === imageId
            ? { ...image, progress: Math.min(pct, 99) }
            : image
        ),
      }))
    const dropDrafts = () =>
      list.patchWatch(watchId, (w) => ({
        ...w,
        images: w.images.filter((image) => !draftIds.has(image.id)),
      }))

    list.patchWatch(watchId, (w) => ({
      ...w,
      images: [...w.images, ...drafts.map((d) => d.image)],
    }))
    list.setImageBusy(watchId, true)

    try {
      const results = await Promise.allSettled(
        drafts.map((d) =>
          uploadWatchImage(d.file, (pct) => setProgress(d.image.id, pct))
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
      if (!imageKeys.length) {
        dropDrafts()
        return
      }

      const res = await addWatchImages({ watchId, imageKeys })
      if (!res.success) throw new Error(res.message)
      list.patchWatch(watchId, (w) => ({ ...w, images: res.data }))
      toast.success(`${res.message} · ${watch.name}`)
    } catch (error) {
      dropDrafts()
      toast.error(errorMessage(error, "Couldn't add the images."))
    } finally {
      drafts.forEach((d) => URL.revokeObjectURL(d.image.url))
      list.setImageBusy(watchId, false)
    }
  }

  const onFilesPicked = (files: FileList | null) => {
    if (uploadTarget) upload(uploadTarget, files)
  }

  const setCover = async (watch: AdminWatch, imageId: string) => {
    const previous = watch.images
    const image = previous.find((i) => i.id === imageId)
    if (!image || list.imageBusyIds.has(watch.id)) return
    const next = [image, ...previous.filter((i) => i.id !== imageId)]

    list.patchWatch(watch.id, (w) => ({ ...w, images: next }))
    list.setImageBusy(watch.id, true)
    try {
      const res = await reorderWatchImages({
        watchId: watch.id,
        imageIds: next.map((i) => i.id),
      })
      if (!res.success) throw new Error(res.message)
      list.patchWatch(watch.id, (w) => ({ ...w, images: res.data }))
      toast.success(`${res.message} · ${watch.name}`)
    } catch (error) {
      list.patchWatch(watch.id, (w) => ({ ...w, images: previous }))
      toast.error(errorMessage(error, "Couldn't change the cover."))
    } finally {
      list.setImageBusy(watch.id, false)
    }
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
    const res = await deleteWatchImage({ id: target.id })
    if (!res.success) throw new Error(res.message)
    list.patchWatch(target.watchId, (w) => ({
      ...w,
      isActive: res.data.isActive,
      images: w.images.filter((i) => i.id !== target.id),
    }))
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
