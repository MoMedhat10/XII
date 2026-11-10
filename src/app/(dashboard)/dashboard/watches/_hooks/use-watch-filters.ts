"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import { watchFiltersSchema, type WatchFilters } from "../_utils/watch-schema"
import {
  DEFAULT_FILTERS,
  SEARCH_DEBOUNCE_MS,
  hrefFor,
} from "../_utils/watches-client"

const currentHref = () => window.location.pathname + window.location.search

/**
 * Filters live in the URL. Changing one rewrites the URL with the native
 * History API: Next syncs useSearchParams to it without a server render, the
 * query key changes, and TanStack fetches (or reuses) that page.
 */
export function useWatchFilters() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filters = watchFiltersSchema.parse(Object.fromEntries(searchParams))

  /** The search box text; reaches `filters.q` after a pause in typing. */
  const [search, setSearch] = useState(filters.q)
  /** the q this tab last wrote, to tell typing apart from back/forward */
  const [sentQ, setSentQ] = useState(filters.q)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // the search box only follows the URL when q changed somewhere else
  // (back/forward), never while typing
  if (filters.q !== sentQ) {
    setSentQ(filters.q)
    setSearch(filters.q)
  }

  useEffect(() => () => clearTimeout(searchTimer.current), [])

  // drop junk from hand-edited links (?brand=junk, ?status=nope) once
  const canonical = hrefFor(pathname, filters)
  useEffect(() => {
    if (canonical !== currentHref()) {
      window.history.replaceState(null, "", canonical)
    }
  }, [canonical])

  const navigate = (next: WatchFilters) => {
    clearTimeout(searchTimer.current) // a pending search must not fire later
    setSentQ(next.q)
    const href = hrefFor(pathname, next)
    if (href !== currentHref()) window.history.replaceState(null, "", href)
  }

  /** Any filter change goes back to page 1 (and takes the typed search along). */
  const updateFilters = (patch: Partial<WatchFilters>) => {
    if (patch.q !== undefined) setSearch(patch.q)
    navigate({ ...filters, q: search.trim(), page: 1, ...patch })
  }

  const changeSearch = (value: string) => {
    setSearch(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      if (value.trim() !== filters.q) {
        navigate({ ...filters, q: value.trim(), page: 1 })
      }
    }, SEARCH_DEBOUNCE_MS)
  }

  const clearFilters = () => {
    setSearch("")
    navigate(DEFAULT_FILTERS)
  }

  const goToPage = (page: number) => navigate({ ...filters, page })

  return {
    filters,
    search,
    updateFilters,
    changeSearch,
    clearFilters,
    goToPage,
  }
}

export type WatchFiltersApi = ReturnType<typeof useWatchFilters>
