"use client"

import { usePathname, useSearchParams } from "next/navigation"

import { hrefFor } from "../../_utils/url-filters"
import {
  DEFAULT_OVERVIEW_FILTERS,
  overviewFiltersSchema,
  type OverviewRange,
} from "../_utils/overview-schema"

/**
 * The overview's period, kept in the URL (?range=7d). Changing it rewrites
 * the URL with the History API: no server render, the query key changes and
 * TanStack fetches (or reuses) that range.
 */
export function useOverviewRange() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filters = overviewFiltersSchema.parse(Object.fromEntries(searchParams))

  const setRange = (range: OverviewRange) => {
    const href = hrefFor(pathname, { range }, DEFAULT_OVERVIEW_FILTERS)
    window.history.replaceState(null, "", href)
  }

  return { filters, setRange }
}
