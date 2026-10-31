"use client"

import type { CatalogBrand } from "@/app/(app)/watches/_data/types"
import { PRICE_STEP } from "@/app/(app)/watches/_utils/catalog-schema"
import { cn } from "@/lib/utils"

import { monoCaption } from "../home/styles"

/** $12,400 -> "$12.4k" */
export const shortPrice = (dollars: number) =>
  "$" + (dollars / 1000).toFixed(dollars % 1000 ? 1 : 0) + "k"

const heading = cn(monoCaption, "block border-b-2 border-surface-variant pb-3")

export function BrandFilter({
  brands,
  selected,
  loading,
  onToggle,
}: {
  brands: CatalogBrand[]
  selected: string[]
  loading: boolean
  onToggle: (id: string) => void
}) {
  return (
    <div>
      <span className={cn(heading, "mb-2")}>BRAND</span>
      {loading &&
        Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="my-3 h-5 animate-[xii-pulse_1.4s_ease-in-out_infinite] bg-card"
          />
        ))}
      {brands.map((b) => {
        const on = selected.includes(b.id)
        return (
          <button
            key={b.id}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(b.id)}
            className="flex w-full items-center gap-3 py-2.5 text-left font-sans text-base font-medium transition-colors hover:text-gold"
          >
            <span
              className={cn(
                "size-5 flex-none border-4 border-foreground",
                on ? "bg-gold" : "bg-transparent"
              )}
            />
            <span className="flex-1">{b.name}</span>
            <span className="font-mono text-xs text-[#8a8384]">{b.count}</span>
          </button>
        )
      })}
    </div>
  )
}

export function PriceFilter({
  max,
  lo,
  hi,
  onLo,
  onHi,
}: {
  /** slider ceiling, whole dollars */
  max: number
  lo: number
  hi: number
  onLo: (value: number) => void
  onHi: (value: number) => void
}) {
  const pct = (v: number) => `${(v / max) * 100}%`

  return (
    <div>
      <span className={cn(heading, "mb-5")}>PRICE</span>
      <div className="relative h-6">
        <div className="absolute inset-x-0 top-2.5 h-1 bg-surface-variant" />
        <div
          className="absolute top-2.5 h-1 bg-gold"
          style={{ left: pct(lo), right: `calc(100% - ${pct(hi)})` }}
        />
        <input
          type="range"
          min={0}
          max={max}
          step={PRICE_STEP}
          value={lo}
          onChange={(e) => onLo(Math.min(+e.target.value, hi - PRICE_STEP))}
          aria-label="Minimum price"
          className="xii-range absolute inset-0 m-0 w-full"
        />
        <input
          type="range"
          min={0}
          max={max}
          step={PRICE_STEP}
          value={hi}
          onChange={(e) => onHi(Math.max(+e.target.value, lo + PRICE_STEP))}
          aria-label="Maximum price"
          className="xii-range absolute inset-0 m-0 w-full"
        />
      </div>
      <div className="mt-3 flex justify-between font-heading text-base font-bold">
        <span>{shortPrice(lo)}</span>
        <span>
          {shortPrice(hi)}
          {hi >= max && "+"}
        </span>
      </div>
    </div>
  )
}
