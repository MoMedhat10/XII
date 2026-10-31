"use client"

import {
  CATALOG_SORTS,
  SORT_LABELS,
  type CatalogSort,
} from "@/app/(app)/watches/_utils/catalog-schema"
import { cn } from "@/lib/utils"

import { eyebrow, monoCaption } from "../home/styles"

export const enter = "animate-[xii-up_0.8s_cubic-bezier(0.2,0.7,0.2,1)_both]"

export function CatalogToolbar({
  total,
  sort,
  onSort,
}: {
  /** matching pieces, or null while loading */
  total: number | null
  sort: CatalogSort
  onSort: (sort: CatalogSort) => void
}) {
  return (
    <div
      className={cn(
        enter,
        "flex flex-wrap items-end justify-between gap-6 pb-8"
      )}
    >
      <div>
        <span className={cn(eyebrow, "mb-2")}>The Catalog</span>
        <h1 className="font-heading text-[clamp(48px,6vw,88px)] leading-none font-bold tracking-[-0.02em]">
          All Watches
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span className={cn(monoCaption, "uppercase")} aria-live="polite">
          {total === null ? "—" : `${total} pieces`}
        </span>
        <label className="relative flex h-12 items-center border-4 bg-background">
          <span className={cn(monoCaption, "px-3")}>SORT</span>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as CatalogSort)}
            className="h-full cursor-pointer border-0 border-l-4 bg-background px-3 font-sans text-[13px] font-bold tracking-[1.5px] uppercase outline-none"
          >
            {CATALOG_SORTS.map((s) => (
              <option key={s} value={s}>
                {SORT_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
