"use client"

import { useEffect } from "react"
import {
  keepPreviousData,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { adminQueryDefaults, getJson } from "../../../_utils/admin-fetch"
import { hrefFor } from "../../../_utils/url-filters"
import type { AdminUserDetail, AdminUserPage } from "../_data/types"
import { DEFAULT_USER_FILTERS, type UserFilters } from "../_utils/user-schema"
import { userKeys } from "../_utils/keys"

export const userPageQuery = (filters: UserFilters) =>
  queryOptions({
    queryKey: userKeys.list(filters),
    queryFn: ({ signal }) =>
      getJson<AdminUserPage>(
        hrefFor("/api/admin/users", filters, DEFAULT_USER_FILTERS),
        signal
      ),
    ...adminQueryDefaults,
  })

export const userDetailQuery = (id: string) =>
  queryOptions({
    queryKey: userKeys.detail(id),
    queryFn: ({ signal }) =>
      getJson<AdminUserDetail>(`/api/admin/users/${id}`, signal),
    ...adminQueryDefaults,
  })

/**
 * One page of users. Keeps the current rows on screen while the next
 * filters load, fixes a clamped page (?page=99) without fetching twice, and
 * prefetches the next page.
 */
export function useUserPage(
  filters: UserFilters,
  goToPage: (page: number) => void
) {
  const queryClient = useQueryClient()
  const query = useQuery({
    ...userPageQuery(filters),
    placeholderData: keepPreviousData,
  })
  const { data, isPlaceholderData: stale } = query

  const clampedPage =
    !stale && data && data.page !== filters.page ? data.page : null
  useEffect(() => {
    if (clampedPage === null || !data) return
    queryClient.setQueryData(
      userKeys.list({ ...filters, page: clampedPage }),
      data
    )
    goToPage(clampedPage)
  })

  const nextPage =
    !stale && data && data.page < data.pageCount ? data.page + 1 : null
  useEffect(() => {
    if (nextPage === null) return
    void queryClient.prefetchQuery(
      userPageQuery({ ...filters, page: nextPage })
    )
  })

  return { ...query, stale }
}

/** The drawer's user; fetches only while an id is set (drawer open). */
export function useUserDetail(id: string | null) {
  return useQuery({
    ...userDetailQuery(id ?? ""),
    enabled: id !== null,
  })
}
