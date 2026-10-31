"use client"

import { useEffect } from "react"
import { toast } from "sonner"

import {
  CATALOG_PAGE_SIZE,
  type CatalogFilters,
} from "../_utils/catalog-schema"
import { useCatalog } from "./use-catalog"

export type CatalogResultsView = "loading" | "error" | "empty" | "grid"


export function useCatalogResults({
  filters,
  pages,
  setPages,
}: {
  filters: CatalogFilters
  pages: number
  setPages: (count: number) => void
}) {
  const catalog = useCatalog(filters)
  const {
    data,
    isSuccess,
    isPlaceholderData,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = catalog

  const loaded = data?.pages ?? []
  const loadedCount = loaded.length

  useEffect(() => {
    // wait for real data for these filters, and for any fetch in flight
    if (!isSuccess || isPlaceholderData || isFetching) return
    if (loadedCount < pages && hasNextPage) {
      void fetchNextPage()
      return
    }
    if (loadedCount !== pages) setPages(loadedCount)
  }, [
    isSuccess,
    isPlaceholderData,
    isFetching,
    hasNextPage,
    fetchNextPage,
    loadedCount,
    pages,
    setPages,
  ])

  const watches = loaded.flatMap((p) => p.watches)
  const total = loaded[0]?.total ?? 0
  const nextCount = Math.min(
    CATALOG_PAGE_SIZE,
    Math.max(0, total - watches.length)
  )

  const view: CatalogResultsView =
    catalog.isError && !catalog.isFetchNextPageError
      ? "error"
      : catalog.isPending
        ? "loading"
        : watches.length
          ? "grid"
          : "empty"

  const loadMore = async () => {
    if (catalog.isFetchingNextPage) return
    const result = await fetchNextPage()
    if (result.isError) toast.error("Couldn't load more pieces. Try again.")
  }

  return {
    view,
    pages: loaded,
    watches,
    /** matching watches; null until the first page arrives */
    total: isSuccess ? total : null,
    nextCount,
    hasNextPage,
    isFetchingNextPage: catalog.isFetchingNextPage,
    /** showing the previous filters' results while new ones load */
    isStale: isPlaceholderData,
    isRetrying: catalog.isError && isFetching,
    loadMore,
    retry: () => void catalog.refetch(),
  }
}

export type CatalogResults = ReturnType<typeof useCatalogResults>
