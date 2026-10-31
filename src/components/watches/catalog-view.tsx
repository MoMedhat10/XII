"use client"

import { useCatalogFacets } from "@/app/(app)/watches/_hooks/use-catalog"
import { useCatalogFilters } from "@/app/(app)/watches/_hooks/use-catalog-filters"
import { useCatalogResults } from "@/app/(app)/watches/_hooks/use-catalog-results"
import { useFavoriteToggle } from "@/app/(app)/watches/_hooks/use-favorite-toggle"
import {
  PRICE_STEP,
  priceCeiling,
} from "@/app/(app)/watches/_utils/catalog-schema"
import { cn } from "@/lib/utils"

import { gutter } from "../home/styles"
import { BrandFilter, PriceFilter } from "./catalog-filters"
import { CatalogResults } from "./catalog-results"
import { CatalogToolbar } from "./catalog-toolbar"
import { FilterChips } from "./filter-chips"
import { SearchBar } from "./search-bar"

export function CatalogView() {
  const facets = useCatalogFacets()
  const brands = facets.data?.brands ?? []
  const priceMax = priceCeiling(facets.data?.maxPriceCents)

  const f = useCatalogFilters(priceMax)
  const results = useCatalogResults({
    filters: f.filters,
    pages: f.pages,
    setPages: f.setPages,
  })
  const favorites = useFavoriteToggle()

  const retry = () => {
    results.retry()
    if (facets.isError) void facets.refetch()
  }

  return (
    <>
      <section className={cn(gutter, "pt-20 sm:pt-28")}>
        <CatalogToolbar
          total={results.total}
          sort={f.filters.sort}
          onSort={f.setSort}
        />
        <SearchBar
          value={f.search}
          onChange={f.setSearch}
          onClear={f.clearSearch}
        />
      </section>

      <section
        className={cn(gutter, "flex flex-wrap items-start gap-10 pt-10 pb-30")}
      >
        <aside className="flex max-w-full flex-[1_1_240px] flex-col gap-8 lg:sticky lg:top-8 lg:max-w-[280px]">
          <BrandFilter
            brands={brands}
            selected={f.filters.brand}
            loading={facets.isPending}
            onToggle={f.toggleBrand}
          />
          <PriceFilter
            max={priceMax}
            lo={Math.min(f.price.lo, priceMax - PRICE_STEP)}
            hi={f.price.hi}
            onLo={f.setLo}
            onHi={f.setHi}
          />
          <button
            type="button"
            onClick={f.clearAll}
            className="self-start border-b-2 border-foreground pb-1 font-sans text-xs font-bold tracking-[1.5px] uppercase transition-colors hover:border-gold hover:text-gold"
          >
            Clear all filters
          </button>
        </aside>

        <div className="min-w-0 flex-[999_1_560px]">
          {results.view !== "loading" && (
            <FilterChips
              search={f.search}
              brandIds={f.filters.brand}
              brands={brands}
              price={f.price}
              priceMax={priceMax}
              onClearSearch={f.clearSearch}
              onToggleBrand={f.toggleBrand}
              onResetPrice={f.resetPrice}
            />
          )}
          <CatalogResults
            results={results}
            query={f.filters.q}
            isSaved={favorites.isSaved}
            onToggleSave={favorites.toggle}
            onRetry={retry}
            onClearFilters={f.clearAll}
          />
        </div>
      </section>
    </>
  )
}
