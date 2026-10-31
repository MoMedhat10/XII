"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import {
  FILTER_DEBOUNCE_MS,
  catalogHref,
  parseCatalogUrl,
  type CatalogFilters,
  type CatalogSort,
} from "../_utils/catalog-schema"

export type PriceRange = { lo: number; hi: number }

/** Edits waiting for a pause in typing or dragging. */
type Pending = { q?: string; price?: PriceRange }

const readUrl = () =>
  parseCatalogUrl(new URLSearchParams(window.location.search))

const readFilters = (): CatalogFilters => {
  const { q, brand, min, max, sort } = readUrl()
  return { q, brand, min, max, sort }
}


export function useCatalogFilters(priceMax: number) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { pages, ...filters } = parseCatalogUrl(searchParams)

  /** The search box text. Reaches `filters.q` after a pause in typing. */
  const [search, setSearchText] = useState(filters.q)
  /** the q this tab last wrote, to tell our own writes apart from others */
  const [sentQ, setSentQ] = useState(filters.q)
  /** the slider position while dragging; null once it's in the URL */
  const [priceDraft, setPriceDraft] = useState<PriceRange | null>(null)

  const pending = useRef<Pending>({})
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // the box only follows the URL when q changed somewhere else (Clear all,
  // a chip, the canonical rewrite), never while typing
  if (filters.q !== sentQ) {
    setSentQ(filters.q)
    setSearchText(filters.q)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  // drop junk from hand-edited links (?brand=junk, ?pages=999) once
  const canonical = catalogHref(pathname, filters, pages)
  useEffect(() => {
    if (canonical !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", canonical)
    }
  }, [canonical])

  const write = (next: CatalogFilters, nextPages: number) => {
    const href = catalogHref(pathname, next, nextPages)
    if (href !== window.location.pathname + window.location.search) {
      window.history.replaceState(null, "", href)
    }
  }

  const toBounds = ({ lo, hi }: PriceRange) => ({
    min: lo > 0 ? lo : undefined,
    max: hi < priceMax ? hi : undefined,
  })

  
  const commit = (
    update: (current: CatalogFilters) => Partial<CatalogFilters> = () => ({})
  ) => {
    clearTimeout(timer.current)
    const { q, price } = pending.current
    pending.current = {}

    const base: CatalogFilters = {
      ...readFilters(),
      ...(q !== undefined && { q: q.trim() }),
      ...(price && toBounds(price)),
    }
    const next = { ...base, ...update(base) }

    setSentQ(next.q)
    if (price) setPriceDraft(null)
    write(next, 1)
  }

  const schedule = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => commit(), FILTER_DEBOUNCE_MS)
  }

  const setSearch = (value: string) => {
    setSearchText(value)
    pending.current.q = value
    schedule()
  }

  const clearSearch = () => {
    setSearchText("")
    pending.current.q = undefined
    commit(() => ({ q: "" }))
  }

  const committedPrice: PriceRange = {
    lo: filters.min ?? 0,
    hi: Math.min(filters.max ?? priceMax, priceMax),
  }
  const price = priceDraft ?? committedPrice

  const setPrice = (next: PriceRange) => {
    setPriceDraft(next)
    pending.current.price = next
    schedule()
  }

  const resetPrice = () => {
    setPriceDraft(null)
    pending.current.price = undefined
    commit(() => ({ min: undefined, max: undefined }))
  }

  const toggleBrand = (id: string) =>
    commit(({ brand }) => ({
      brand: brand.includes(id)
        ? brand.filter((b) => b !== id)
        : [...brand, id],
    }))

  const setSort = (sort: CatalogSort) => commit(() => ({ sort }))

  /** Keeps the sort, like the design's "Clear all filters". */
  const clearAll = () => {
    clearTimeout(timer.current)
    pending.current = {}
    setSearchText("")
    setSentQ("")
    setPriceDraft(null)
    write({ q: "", brand: [], sort: readUrl().sort }, 1)
  }

  /** Records how many "load more" pages are on screen. */
  const setPages = (count: number) => {
    if (count !== readUrl().pages) write(readFilters(), count)
  }

  return {
    /** committed filters: what the catalog query uses */
    filters,
    /** "load more" pages to show, from the URL */
    pages,
    search,
    setSearch,
    clearSearch,
    price,
    setLo: (lo: number) => setPrice({ lo, hi: price.hi }),
    setHi: (hi: number) => setPrice({ lo: price.lo, hi }),
    resetPrice,
    toggleBrand,
    setSort,
    clearAll,
    setPages,
  }
}

export type CatalogFiltersApi = ReturnType<typeof useCatalogFilters>
