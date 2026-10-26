"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

import type { WatchFilters } from "../_utils/watch-schema"
import {
  DEFAULT_FILTERS,
  SEARCH_DEBOUNCE_MS,
  hrefFor,
} from "../_utils/watches-client"

/**
 * Filters live in the URL. Changing one navigates, the server returns the
 * matching page, and these filters re-sync from it.
 */
export function useWatchFilters({
  serverFilters,
}: {
  serverFilters: WatchFilters
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [navigating, startNavigation] = useTransition()

  /** Filters last sent to the server (or received back from it). */
  const [filters, setFilters] = useState(serverFilters)
  /** The search box text; reaches `filters.q` after a pause in typing. */
  const [search, setSearch] = useState(serverFilters.q)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [synced, setSynced] = useState(serverFilters)
  if (synced !== serverFilters) {
    // only touch the search box when the change didn't come from typing in it
    if (serverFilters.q !== filters.q) setSearch(serverFilters.q)
    setFilters(serverFilters)
    setSynced(serverFilters)
  }

  useEffect(() => () => clearTimeout(searchTimer.current), [])

  // The server may clamp or drop bad values (?page=99, ?brand=junk): show
  // the canonical URL without fetching again.
  useEffect(() => {
    const canonical = hrefFor(pathname, serverFilters)
    if (canonical !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", canonical)
    }
  }, [pathname, serverFilters])

  const navigate = (next: WatchFilters) => {
    clearTimeout(searchTimer.current) // a pending search must not fire later
    setFilters(next)
    startNavigation(() =>
      router.replace(hrefFor(pathname, next), { scroll: false })
    )
  }

  /** Any filter change goes back to page 1 (and takes the typed search along). */
  const updateFilters = (patch: Partial<WatchFilters>) => {
    if (patch.q !== undefined) setSearch(patch.q)
    navigate({ ...filters, q: search.trim(), page: 1, ...patch })
  }

  /** Debounced: navigates once typing pauses. */
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
    /** a filter change is loading */
    navigating,
    updateFilters,
    changeSearch,
    clearFilters,
    goToPage,
  }
}

export type WatchFiltersApi = ReturnType<typeof useWatchFilters>
