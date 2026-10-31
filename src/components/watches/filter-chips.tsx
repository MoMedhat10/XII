"use client"

import type { CatalogBrand } from "@/app/(app)/watches/_data/types"
import type { PriceRange } from "@/app/(app)/watches/_hooks/use-catalog-filters"

import { shortPrice } from "./catalog-filters"

type Chip = { key: string; label: string; remove: () => void }

export function FilterChips({
  search,
  brandIds,
  brands,
  price,
  priceMax,
  onClearSearch,
  onToggleBrand,
  onResetPrice,
}: {
  search: string
  brandIds: string[]
  /** for the names; ids that aren't listed show as "Brand" */
  brands: CatalogBrand[]
  price: PriceRange
  priceMax: number
  onClearSearch: () => void
  onToggleBrand: (id: string) => void
  onResetPrice: () => void
}) {
  const q = search.trim()
  const priceOn = price.lo > 0 || price.hi < priceMax

  const chips: Chip[] = [
    ...(q ? [{ key: "q", label: `“${q}”`, remove: onClearSearch }] : []),
    ...brandIds.map((id) => ({
      key: id,
      label: brands.find((b) => b.id === id)?.name ?? "Brand",
      remove: () => onToggleBrand(id),
    })),
    ...(priceOn
      ? [
          {
            key: "price",
            label: `${shortPrice(price.lo)} – ${shortPrice(price.hi)}${price.hi >= priceMax ? "+" : ""}`,
            remove: onResetPrice,
          },
        ]
      : []),
  ]

  if (!chips.length) return null
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.remove}
          aria-label={`Remove filter ${c.label}`}
          className="flex h-9 items-center gap-2.5 border-4 border-gold px-3 font-sans text-xs font-bold tracking-[1px] uppercase transition-colors hover:bg-gold hover:text-black"
        >
          {c.label}
          <span aria-hidden="true">✕</span>
        </button>
      ))}
    </div>
  )
}
