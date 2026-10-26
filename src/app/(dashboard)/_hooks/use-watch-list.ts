"use client"

import { useOptimistic, useState } from "react"

import type {
  AdminBrand,
  AdminWatchImage,
  AdminWatchPage,
} from "../_data/types"
import { toggleId } from "../_utils/watches-client"

export type OptimisticChange =
  | { type: "active"; id: string; isActive: boolean }
  | { type: "cover"; id: string; imageId: string }

export function useWatchList({
  data,
  brands,
}: {
  data: AdminWatchPage
  brands: AdminBrand[]
}) {
  // The server props are the only source of data. This layer shows an
  // in-flight change and drops it on its own once the action and its
  // revalidatePath refresh finish (or the action fails).
  const [optimistic, applyOptimistic] = useOptimistic(
    data.watches,
    (watches, change: OptimisticChange) =>
      watches.map((w) => {
        if (w.id !== change.id) return w
        if (change.type === "active") return { ...w, isActive: change.isActive }
        const cover = w.images.find((i) => i.id === change.imageId)
        if (!cover) return w
        return { ...w, images: [cover, ...w.images.filter((i) => i !== cover)] }
      })
  )

  // Upload tiles live apart from the rows, so a refresh can't wipe them.
  const [uploads, setUploads] = useState<
    Readonly<Record<string, AdminWatchImage[]>>
  >({})
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set())
  /** rows with an image upload or reorder in flight (image controls lock) */
  const [imageBusyIds, setImageBusyIds] = useState<ReadonlySet<string>>(
    new Set()
  )

  const watches = optimistic.map((w) =>
    uploads[w.id]?.length
      ? { ...w, images: [...w.images, ...uploads[w.id]] }
      : w
  )

  const addUploads = (watchId: string, tiles: AdminWatchImage[]) =>
    setUploads((u) => ({ ...u, [watchId]: [...(u[watchId] ?? []), ...tiles] }))

  const setUploadProgress = (
    watchId: string,
    tileId: string,
    progress: number
  ) =>
    setUploads((u) => ({
      ...u,
      [watchId]: (u[watchId] ?? []).map((t) =>
        t.id === tileId ? { ...t, progress } : t
      ),
    }))

  const dropUploads = (watchId: string, tileIds: ReadonlySet<string>) =>
    setUploads((u) => {
      const { [watchId]: tiles = [], ...rest } = u
      const left = tiles.filter((t) => !tileIds.has(t.id))
      return left.length ? { ...rest, [watchId]: left } : rest
    })

  return {
    data,
    watches,
    brands,
    applyOptimistic,
    addUploads,
    setUploadProgress,
    dropUploads,
    pendingIds,
    setPending: toggleId(setPendingIds),
    imageBusyIds,
    setImageBusy: toggleId(setImageBusyIds),
  }
}

export type WatchList = ReturnType<typeof useWatchList>
