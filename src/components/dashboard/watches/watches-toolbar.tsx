"use client"

import type { AdminBrand } from "@/app/(dashboard)/_data/types"
import {
  WATCH_STATUS_FILTERS,
  type WatchFilters,
  type WatchStatusFilter,
} from "@/app/(dashboard)/_utils/watch-schema"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const STATUS_LABELS: Record<WatchStatusFilter, string> = {
  all: "All",
  live: "Live",
  draft: "Draft",
}

const control =
  "h-12 border-2 border-surface-variant bg-[#141515] text-foreground outline-none focus:border-foreground focus:ring-0 dark:border-surface-variant dark:bg-[#141515] dark:focus:border-foreground"

export function WatchesToolbar({
  filters,
  brands,
  onChange,
  onClear,
}: {
  filters: WatchFilters
  brands: AdminBrand[]
  onChange: (patch: Partial<WatchFilters>) => void
  /** resets search, brand and status */
  onClear: () => void
}) {
  const filtered =
    filters.q.trim() !== "" || filters.brand !== "" || filters.status !== "all"

  return (
    <div className="flex flex-wrap items-center gap-3 border-b-2 border-surface-variant py-5">
      <Input
        type="search"
        value={filters.q}
        maxLength={100}
        onChange={(event) => onChange({ q: event.target.value })}
        placeholder="Search name or model"
        aria-label="Search watches"
        className={cn(control, "min-w-0 flex-[1_1_260px] px-4 text-[15px]")}
      />

      <select
        value={filters.brand}
        onChange={(event) => onChange({ brand: event.target.value })}
        aria-label="Filter by brand"
        className={cn(
          control,
          "min-w-[180px] flex-1 cursor-pointer px-3.5 text-[13px] font-semibold tracking-[1px] uppercase sm:flex-none"
        )}
      >
        <option value="">All brands</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>

      <div
        role="radiogroup"
        aria-label="Filter by status"
        className="flex border-2 border-surface-variant max-sm:w-full"
      >
        {WATCH_STATUS_FILTERS.map((status) => {
          const active = filters.status === status
          return (
            <button
              key={status}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange({ status })}
              className={cn(
                "h-11 px-4 font-heading text-xs font-bold tracking-[1.5px] uppercase transition-colors max-sm:flex-1",
                active
                  ? "bg-foreground text-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {STATUS_LABELS[status]}
            </button>
          )
        })}
      </div>

      {filtered && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear all filters"
          className="h-12 border-2 border-surface-variant px-4 font-heading text-xs font-bold tracking-[1.5px] text-muted-foreground uppercase transition-colors hover:border-gold hover:text-gold max-sm:w-full"
        >
          ✕ Clear
        </button>
      )}
    </div>
  )
}
