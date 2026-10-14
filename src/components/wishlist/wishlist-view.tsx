"use client"

import { useState } from "react"
import { toast } from "sonner"

import { ImageFallback } from "@/components/image-fallback"
import { cn } from "@/lib/utils"

import { eyebrow, gutter, monoCaption } from "../home/styles"
import { WishlistEmpty } from "./wishlist-empty"
import { WishlistSelectionBar } from "./wishlist-selection-bar"

export type WishlistItem = {
  id: string
  name: string
  model: string
  brand: string
  price: number
  stock: number
  available: boolean
  image?: string
  saved: string
  inBag: boolean
}

const usd = (n: number) => "$" + n.toLocaleString("en-US")

// Below xl the table collapses into stacked cards; xl shows the full columns.
const xlColumns =
  "xl:grid-cols-[40px_88px_minmax(220px,1.6fr)_minmax(150px,1fr)_minmax(150px,1fr)_120px_196px] xl:items-center xl:gap-5"

const columns = `grid grid-cols-[24px_1fr] items-center gap-4 ${xlColumns}`

const rowLayout = `grid grid-cols-[24px_72px_1fr] items-start gap-x-4 gap-y-3 sm:grid-cols-[24px_88px_1fr] ${xlColumns}`

function flagFor(item: WishlistItem) {
  if (!item.available) return "Sold out"
  if (item.stock <= 3) return `Only ${item.stock} left`
  return null
}

function Checkbox({
  checked = false,
  label,
  onClick,
}: {
  checked?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "size-6 cursor-pointer border-4",
        checked ? "bg-gold" : "bg-transparent"
      )}
    />
  )
}

export function WishlistView({
  items: initialItems,
}: {
  items: WishlistItem[]
}) {
  // Local-only simulation: nothing is persisted.
  const [items, setItems] = useState(initialItems)
  const [selected, setSelected] = useState<string[]>([])

  const selItems = items.filter((i) => selected.includes(i.id))
  const allSelected = items.length > 0 && selItems.length === items.length

  const toggle = (id: string) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    )

  const remove = (ids: string[]) => {
    setItems((list) => list.filter((i) => !ids.includes(i.id)))
    setSelected((s) => s.filter((id) => !ids.includes(id)))
    toast.success(
      ids.length === 1
        ? "Removed from your collection"
        : `Removed ${ids.length} pieces from your collection`
    )
  }

  const addToBag = (ids: string[]) => {
    const addable = items.filter(
      (i) => ids.includes(i.id) && i.available && !i.inBag
    )
    if (!addable.length) {
      toast.error(
        "Nothing to add — those pieces are unavailable or already in your bag"
      )
      return
    }
    const added = addable.map((i) => i.id)
    setItems((list) =>
      list.map((i) => (added.includes(i.id) ? { ...i, inBag: true } : i))
    )
    setSelected((s) => s.filter((id) => !added.includes(id)))
    toast.success(
      added.length === 1
        ? "Added to your bag"
        : `Added ${added.length} pieces to your bag`
    )
  }

  if (!items.length) return <WishlistEmpty />
  return (
    <>
      <section className={cn(gutter, "pt-20 pb-56 sm:pt-28 sm:pb-40")}>
        <div className="flex flex-wrap items-end justify-between gap-6 border-b-4 pb-6 sm:gap-8 sm:pb-8">
          <div>
            <span className={cn(eyebrow, "mb-2")}>Private Register</span>
            <h1 className="font-heading text-[clamp(36px,6vw,88px)] leading-none font-bold tracking-[-0.02em]">
              Saved Pieces
            </h1>
          </div>
          <div className="grid w-full grid-cols-2 border-4 sm:w-auto">
            <div className="border-r-4 px-4 py-3 sm:min-w-40 sm:px-6 sm:py-4">
              <span className={cn(monoCaption, "block")}>PIECES</span>
              <span className="block font-heading text-[28px] leading-9 font-bold sm:text-[40px] sm:leading-12">
                {String(items.length).padStart(2, "0")}
              </span>
            </div>
            <div className="px-4 py-3 sm:min-w-40 sm:px-6 sm:py-4">
              <span className={cn(monoCaption, "block")}>TOTAL VALUE</span>
              <span className="block font-heading text-[28px] leading-9 font-bold text-gold sm:text-[40px] sm:leading-12">
                {usd(items.reduce((sum, i) => sum + i.price, 0))}
              </span>
            </div>
          </div>
        </div>

        <div
          className={cn(
            columns,
            monoCaption,
            "border-b-2 border-surface-variant px-4 py-4"
          )}
        >
          <Checkbox
            checked={allSelected}
            label="Select all"
            onClick={() =>
              setSelected(allSelected ? [] : items.map((i) => i.id))
            }
          />
          <span className="xl:hidden">SELECT ALL</span>
          <span className="max-xl:hidden" />
          <span className="max-xl:hidden">REFERENCE</span>
          <span className="max-xl:hidden">BRAND</span>
          <span className="max-xl:hidden">AVAILABILITY</span>
          <span className="text-right max-xl:hidden">PRICE</span>
          <span className="max-xl:hidden" />
        </div>

        {items.map((item) => {
          const on = selected.includes(item.id)
          const flag = flagFor(item)
          const status = item.available ? "In stock" : "Unavailable"
          return (
            <div
              key={item.id}
              className={cn(
                rowLayout,
                "border-b-2 border-surface-variant px-4 py-5 transition-colors hover:bg-card",
                on && "bg-card"
              )}
            >
              <Checkbox
                checked={on}
                label={`Select ${item.name}`}
                onClick={() => toggle(item.id)}
              />
              <ImageFallback
                fill
                unoptimized
                sizes="88px"
                src={item.image}
                alt={item.name}
                label="Photo"
                wrapperClassName="aspect-square border-4"
                className="object-cover"
              />
              <div className="min-w-0">
                <span className="block font-sans text-xs leading-5 tracking-[0.1em] text-muted-foreground uppercase sm:text-sm">
                  {item.model} · saved {item.saved}
                </span>
                <span className="block font-heading text-xl leading-7 font-semibold sm:text-2xl sm:leading-8 xl:text-[28px] xl:leading-[34px]">
                  {item.name}
                </span>
                <span className="mt-1 block font-sans text-sm leading-5 text-muted-foreground xl:hidden">
                  {item.brand} · {status}
                </span>
                {flag && (
                  <span className="mt-2 inline-block border-2 border-gold px-2 py-0.5 font-heading text-[11px] leading-4 font-bold tracking-[1.5px] text-gold uppercase">
                    {flag}
                  </span>
                )}
              </div>
              <span className="font-sans text-base leading-6 max-xl:hidden">
                {item.brand}
              </span>
              <span className="font-sans text-base leading-6 max-xl:hidden">
                {status}
              </span>
              <span className="font-heading text-lg leading-7 font-bold tracking-[1px] text-gold max-xl:col-start-3 sm:text-xl xl:text-right">
                {usd(item.price)}
              </span>
              <div className="flex gap-2 max-xl:col-span-3 xl:justify-end">
                <button
                  type="button"
                  disabled={item.inBag || !item.available}
                  onClick={() => addToBag([item.id])}
                  className={cn(
                    "h-11 flex-1 cursor-pointer border-4 px-4 font-sans text-xs font-bold tracking-[1.5px] uppercase transition-colors disabled:cursor-default disabled:opacity-60 xl:flex-none",
                    item.inBag
                      ? "bg-foreground text-black"
                      : "bg-background hover:border-gold hover:bg-gold hover:text-white"
                  )}
                >
                  {item.inBag ? "In Bag ✓" : "Add to Bag"}
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => remove([item.id])}
                  className="size-11 shrink-0 cursor-pointer border-4 bg-background font-heading text-base font-bold transition-colors hover:bg-foreground hover:text-black disabled:opacity-60"
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })}
      </section>

      <WishlistSelectionBar
        items={selItems}
        total={usd(selItems.reduce((sum, i) => sum + i.price, 0))}
        onClear={() => setSelected([])}
        onRemove={() => remove(selected)}
        onCompare={() => toast.success(`Comparing ${selItems.length} pieces`)}
        onAddToBag={() => addToBag(selected)}
      />
    </>
  )
}
