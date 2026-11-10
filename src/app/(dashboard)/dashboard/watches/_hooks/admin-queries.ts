"use client"

import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"

import type { AdminBrand, AdminWatchPage } from "../_data/types"
import { adminQueryDefaults, getJson } from "../../../_utils/admin-fetch"
import { adminKeys } from "../_utils/admin-keys"
import { hrefFor } from "../_utils/watches-client"
import type { WatchFilters } from "../_utils/watch-schema"

export const watchPageQuery = (filters: WatchFilters) =>
  queryOptions({
    queryKey: adminKeys.watchList(filters),
    queryFn: ({ signal }) =>
      getJson<AdminWatchPage>(hrefFor("/api/admin/watches", filters), signal),
    ...adminQueryDefaults,
  })

export const brandsQuery = queryOptions({
  queryKey: adminKeys.brands(),
  queryFn: ({ signal }) => getJson<AdminBrand[]>("/api/admin/brands", signal),
  ...adminQueryDefaults,
})

export function useWatchPage(filters: WatchFilters) {
  return useQuery({
    ...watchPageQuery(filters),
    // keep the current rows on screen while another page/filter loads
    placeholderData: keepPreviousData,
  })
}

export function useAdminBrands() {
  return useQuery(brandsQuery)
}
