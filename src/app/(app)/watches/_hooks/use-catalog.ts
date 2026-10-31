"use client"

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { setFavorite } from "../_actions/favorites"
import type { CatalogFacets, CatalogPage, FavoritesState } from "../_data/types"
import {
  toCatalogParams,
  type CatalogFilters,
  type FavoriteInput,
} from "../_utils/catalog-schema"

export const catalogKeys = {
  all: ["catalog"] as const,
  list: (filters: CatalogFilters) => ["catalog", "list", filters] as const,
  facets: ["catalog", "facets"] as const,
  favorites: ["favorites"] as const,
}

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      message?: string
    } | null
    throw new Error(body?.message ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

export function useCatalog(filters: CatalogFilters) {
  return useInfiniteQuery({
    queryKey: catalogKeys.list(filters),
    queryFn: ({ pageParam, signal }) =>
      getJson<CatalogPage>(
        `/api/catalog?${toCatalogParams(filters, pageParam)}`,
        signal
      ),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset ?? undefined,
    // keep the current grid on screen while a new filter set loads
    placeholderData: keepPreviousData,
  })
}

export function useCatalogFacets() {
  return useQuery({
    queryKey: catalogKeys.facets,
    queryFn: ({ signal }) =>
      getJson<CatalogFacets>("/api/catalog/facets", signal),
    staleTime: 5 * 60_000,
  })
}

export function useFavorites() {
  return useQuery({
    queryKey: catalogKeys.favorites,
    queryFn: ({ signal }) => getJson<FavoritesState>("/api/favorites", signal),
  })
}

export function useSetFavorite() {
  const queryClient = useQueryClient()
  const key = catalogKeys.favorites

  return useMutation({
    mutationFn: async (input: FavoriteInput) => {
      const res = await setFavorite(input)
      if (!res.success) throw new Error(res.message)
      return res
    },
    // flip the heart right away and roll back if the action fails
    onMutate: async ({ watchId, saved }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<FavoritesState>(key)
      queryClient.setQueryData<FavoritesState>(key, (old) =>
        old
          ? {
              ...old,
              watchIds: saved
                ? [...new Set([...old.watchIds, watchId])]
                : old.watchIds.filter((id) => id !== watchId),
            }
          : old
      )
      return { previous }
    },
    onError: (_error, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}
