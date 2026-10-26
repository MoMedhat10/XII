import type { Dispatch, SetStateAction } from "react"

import type { AdminWatch } from "../_data/types"
import type { WatchFilters } from "./watch-schema"

export const DEFAULT_FILTERS: WatchFilters = {
  q: "",
  brand: "",
  status: "all",
  page: 1,
}

export const SEARCH_DEBOUNCE_MS = 300

export function hrefFor(pathname: string, filters: WatchFilters) {
  const params = new URLSearchParams()
  for (const key of Object.keys(DEFAULT_FILTERS) as (keyof WatchFilters)[]) {
    const value = filters[key]
    if (value !== DEFAULT_FILTERS[key] && value !== "") {
      params.set(key, String(value))
    }
  }
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

export const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

export const toggleId =
  (setter: Dispatch<SetStateAction<ReadonlySet<string>>>) =>
  (id: string, on: boolean) =>
    setter((current) => {
      const next = new Set(current)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

/**
 * Fresh server rows, except rows with an image upload/reorder in flight keep
 * their local images, so a refresh never wipes upload placeholders.
 */
export function mergeServerWatches(
  fresh: AdminWatch[],
  local: AdminWatch[],
  busyIds: ReadonlySet<string>
) {
  if (!busyIds.size) return fresh
  return fresh.map((watch) => {
    if (!busyIds.has(watch.id)) return watch
    const mine = local.find((w) => w.id === watch.id)
    return mine ? { ...watch, images: mine.images } : watch
  })
}
