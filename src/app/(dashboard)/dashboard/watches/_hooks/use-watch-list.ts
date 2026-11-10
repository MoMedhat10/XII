"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import type { AdminWatchImage } from "../_data/types"
import { adminKeys } from "../_utils/admin-keys"
import { toggleId } from "../_utils/watches-client"
import { useImagePendingIds, useTogglePendingIds } from "./admin-mutations"
import { useAdminBrands, useWatchPage, watchPageQuery } from "./admin-queries"
import type { WatchFiltersApi } from "./use-watch-filters"

export function useWatchList({ filters: api }: { filters: WatchFiltersApi }) {
  const queryClient = useQueryClient()
  const { filters } = api
  const pageQuery = useWatchPage(filters)
  const brandsQuery = useAdminBrands()
  const data = pageQuery.data
  /** true while the rows on screen belong to the previous filters/page */
  const stale = pageQuery.isPlaceholderData

  // Upload tiles are UI state, not server state: they live outside the cache
  // so a refetch can't wipe them.
  const [uploads, setUploads] = useState<
    Readonly<Record<string, AdminWatchImage[]>>
  >({})
  /** rows whose files are still uploading to storage (before the action runs) */
  const [uploadingIds, setUploadingIds] = useState<ReadonlySet<string>>(
    new Set()
  )

  const togglePending = useTogglePendingIds()
  const imagePending = useImagePendingIds()
  const pendingIds = new Set(togglePending)
  /** rows with an image upload, reorder or delete in flight (image controls lock) */
  const imageBusyIds = new Set([...uploadingIds, ...imagePending])

  const watches = (data?.watches ?? []).map((w) =>
    uploads[w.id]?.length
      ? { ...w, images: [...w.images, ...uploads[w.id]] }
      : w
  )

  // The server clamps the page (?page=99, or the last row of the last page
  // was deleted). Cache the answer under the real page, then show that URL,
  // so switching keys doesn't fetch the same rows again.
  const clampedPage =
    !stale && data && data.page !== filters.page ? data.page : null
  useEffect(() => {
    if (clampedPage === null || !data) return
    queryClient.setQueryData(
      adminKeys.watchList({ ...filters, page: clampedPage }),
      data
    )
    api.goToPage(clampedPage)
  })

  // Prefetch the next page so "Next →" is instant.
  const nextPage =
    !stale && data && data.page < data.pageCount ? data.page + 1 : null
  useEffect(() => {
    if (nextPage === null) return
    void queryClient.prefetchQuery(
      watchPageQuery({ ...filters, page: nextPage })
    )
  })

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
    pageQuery,
    brandsQuery,
    data,
    stale,
    watches,
    brands: brandsQuery.data ?? [],
    addUploads,
    setUploadProgress,
    dropUploads,
    pendingIds,
    imageBusyIds,
    setUploading: toggleId(setUploadingIds),
  }
}

export type WatchList = ReturnType<typeof useWatchList>
