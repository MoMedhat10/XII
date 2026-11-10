"use client"

import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"

import type { AdminBrand, AdminWatchPage } from "../_data/types"
import { adminKeys } from "../_utils/admin-keys"
import { hrefFor } from "../_utils/watches-client"
import type { WatchFilters } from "../_utils/watch-schema"

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
  }
}

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string
    } | null
    throw new HttpError(
      body?.message ?? `Request failed (${res.status})`,
      res.status
    )
  }
  return res.json() as Promise<T>
}

// Admin data goes stale quickly (other admins edit too), so these override
// the app-wide defaults in QueryProvider.
const adminDefaults = {
  staleTime: 10_000,
  refetchOnWindowFocus: true,
  // 4xx won't fix itself (signed out, not allowed): fail right away
  retry: (count: number, error: Error) =>
    !(error instanceof HttpError && error.status < 500) && count < 2,
}

export const watchPageQuery = (filters: WatchFilters) =>
  queryOptions({
    queryKey: adminKeys.watchList(filters),
    queryFn: ({ signal }) =>
      getJson<AdminWatchPage>(hrefFor("/api/admin/watches", filters), signal),
    ...adminDefaults,
  })

export const brandsQuery = queryOptions({
  queryKey: adminKeys.brands(),
  queryFn: ({ signal }) => getJson<AdminBrand[]>("/api/admin/brands", signal),
  ...adminDefaults,
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
