import type { Dispatch, SetStateAction } from "react"

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
