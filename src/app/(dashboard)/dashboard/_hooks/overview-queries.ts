"use client"

import { useEffect } from "react"
import {
  keepPreviousData,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { adminQueryDefaults, getJson } from "../../_utils/admin-fetch"
import { hrefFor } from "../../_utils/url-filters"
import type { AdminOverview } from "../_data/overview-types"
import { overviewKeys } from "../_utils/overview-keys"
import {
  DEFAULT_OVERVIEW_FILTERS,
  OVERVIEW_RANGES,
  type OverviewFilters,
} from "../_utils/overview-schema"

export const overviewQuery = (filters: OverviewFilters) =>
  queryOptions({
    queryKey: overviewKeys.detail(filters),
    queryFn: ({ signal }) =>
      getJson<AdminOverview>(
        hrefFor("/api/admin/overview", filters, DEFAULT_OVERVIEW_FILTERS),
        signal
      ),
    ...adminQueryDefaults,
  })

/**
 * The overview for one range. Keeps the current numbers on screen (dimmed)
 * while another range loads, and prefetches the other ranges once this one
 * is in, so switching is usually instant.
 */
export function useOverview(filters: OverviewFilters) {
  const queryClient = useQueryClient()
  const query = useQuery({
    ...overviewQuery(filters),
    placeholderData: keepPreviousData,
  })
  const loaded = query.isSuccess && !query.isPlaceholderData

  useEffect(() => {
    if (!loaded) return
    for (const range of OVERVIEW_RANGES) {
      if (range !== filters.range) {
        void queryClient.prefetchQuery(overviewQuery({ range }))
      }
    }
  }, [loaded, filters.range, queryClient])

  return { ...query, stale: query.isPlaceholderData }
}
