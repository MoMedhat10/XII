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
import type { AdminOrderDetail, AdminOrderPage } from "../_data/types"
import {
  DEFAULT_ORDER_FILTERS,
  type OrderFilters,
} from "../_utils/order-schema"
import { orderKeys } from "../_utils/keys"

export const orderPageQuery = (filters: OrderFilters) =>
  queryOptions({
    queryKey: orderKeys.list(filters),
    queryFn: ({ signal }) =>
      getJson<AdminOrderPage>(
        hrefFor("/api/admin/orders", filters, DEFAULT_ORDER_FILTERS),
        signal
      ),
    ...adminQueryDefaults,
  })

export const orderDetailQuery = (id: string) =>
  queryOptions({
    queryKey: orderKeys.detail(id),
    queryFn: ({ signal }) =>
      getJson<AdminOrderDetail>(`/api/admin/orders/${id}`, signal),
    ...adminQueryDefaults,
  })

/**
 * One page of orders. Keeps the current rows on screen while the next
 * filters load, fixes a clamped page (?page=99) without fetching twice, and
 * prefetches the next page.
 */
export function useOrderPage(
  filters: OrderFilters,
  goToPage: (page: number) => void
) {
  const queryClient = useQueryClient()
  const query = useQuery({
    ...orderPageQuery(filters),
    placeholderData: keepPreviousData,
  })
  const { data, isPlaceholderData: stale } = query

  const clampedPage =
    !stale && data && data.page !== filters.page ? data.page : null
  useEffect(() => {
    if (clampedPage === null || !data) return
    queryClient.setQueryData(
      orderKeys.list({ ...filters, page: clampedPage }),
      data
    )
    goToPage(clampedPage)
  })

  const nextPage =
    !stale && data && data.page < data.pageCount ? data.page + 1 : null
  useEffect(() => {
    if (nextPage === null) return
    void queryClient.prefetchQuery(
      orderPageQuery({ ...filters, page: nextPage })
    )
  })

  return { ...query, stale }
}

/** The drawer's order; fetches only while an id is set (drawer open). */
export function useOrderDetail(id: string | null) {
  return useQuery({
    ...orderDetailQuery(id ?? ""),
    enabled: id !== null,
  })
}
