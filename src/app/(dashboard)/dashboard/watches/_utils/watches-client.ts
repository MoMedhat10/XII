import type { Dispatch, SetStateAction } from "react"

import { hrefFor as sharedHrefFor } from "../../../_utils/url-filters"
import type { WatchFilters } from "./watch-schema"

export const DEFAULT_FILTERS: WatchFilters = {
  q: "",
  brand: "",
  status: "all",
  page: 1,
}

/** The watches page URL for `filters` (defaults left out). */
export const hrefFor = (pathname: string, filters: WatchFilters) =>
  sharedHrefFor(pathname, filters, DEFAULT_FILTERS)

export const toggleId =
  (setter: Dispatch<SetStateAction<ReadonlySet<string>>>) =>
  (id: string, on: boolean) =>
    setter((current) => {
      const next = new Set(current)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

export const pick = <T, K extends keyof T>(obj: T, keys: readonly K[]) =>
  Object.fromEntries(keys.map((key) => [key, obj[key]])) as Pick<T, K>
