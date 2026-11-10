"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import type { z } from "zod"

import {
  SEARCH_DEBOUNCE_MS,
  hrefFor,
  type UrlFilters,
} from "../_utils/url-filters"

const currentHref = () => window.location.pathname + window.location.search

/**
 * Filters for an admin list page, kept in the URL. Changing one rewrites the
 * URL with the native History API: Next syncs useSearchParams to it without a
 * server render, the query key changes, and TanStack fetches (or reuses) that
 * page.
 *
 * `schema` must give every field a fallback (`.catch()`), so any URL parses.
 */
export function useUrlFilters<F extends UrlFilters>({
  schema,
  defaults,
}: {
  schema: z.ZodType<F>
  defaults: F
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const filters = schema.parse(Object.fromEntries(searchParams))

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

  // drop junk from hand-edited links (?status=nope) once
  const canonical = hrefFor(pathname, filters, defaults)
  useEffect(() => {
    if (canonical !== currentHref()) {
      window.history.replaceState(null, "", canonical)
    }
  }, [canonical])

  const navigate = (next: F) => {
    clearTimeout(searchTimer.current) // a pending search must not fire later
    setSentQ(next.q)
    const href = hrefFor(pathname, next, defaults)
    if (href !== currentHref()) window.history.replaceState(null, "", href)
  }

  /** Any filter change goes back to page 1 (and takes the typed search along). */
  const updateFilters = (patch: Partial<F>) => {
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
    navigate(defaults)
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
