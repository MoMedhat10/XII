import { cn } from "@/lib/utils"

import { gutter } from "../home/styles"
import type { WishlistItem } from "./wishlist-view"

const action =
  "h-11 cursor-pointer border-4 border-black px-2 font-sans text-[11px] font-bold tracking-[1px] uppercase transition-colors sm:h-12 sm:px-5 sm:text-[13px] sm:tracking-[1.5px]"

export function WishlistSelectionBar({
  items,
  total,
  onClear,
  onRemove,
  onCompare,
  onAddToBag,
}: {
  items: WishlistItem[]
  total: string
  onClear: () => void
  onRemove: () => void
  onCompare: () => void
  onAddToBag: () => void
}) {
  const open = items.length > 0

  return (
    <div
      aria-hidden={!open}
      inert={!open}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 transition-transform duration-[450ms] ease-[cubic-bezier(.2,.7,.2,1)]",
        open ? "translate-y-0" : "translate-y-[120%]"
      )}
    >
      <div className={cn(gutter, "pb-4 sm:pb-6")}>
        <div className="flex flex-col gap-3 border-4 border-black bg-[#f9f9f9] px-4 py-3 text-black sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="font-heading text-lg leading-7 font-bold sm:text-xl">
              {items.length} selected ·{" "}
              <span className="text-[#7C5A3C]">{total}</span>
            </span>
            <button
              type="button"
              onClick={onClear}
              className="h-10 shrink-0 cursor-pointer px-2 font-sans text-xs font-bold tracking-[1.5px] uppercase underline underline-offset-4 sm:hidden"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
            <button
              type="button"
              onClick={onClear}
              className="hidden h-12 cursor-pointer px-3 font-sans text-[13px] font-bold tracking-[1.5px] uppercase underline-offset-4 hover:underline sm:block"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onRemove}
              className={cn(
                action,
                "bg-[#f9f9f9] hover:bg-black hover:text-white"
              )}
            >
              Remove
            </button>
            <button
              type="button"
              disabled={items.length < 2}
              title={
                items.length < 2 ? "Select at least 2 to compare" : undefined
              }
              onClick={onCompare}
              className={cn(
                action,
                "bg-[#f9f9f9] hover:bg-black hover:text-white disabled:cursor-default disabled:opacity-40 disabled:hover:bg-[#f9f9f9] disabled:hover:text-black"
              )}
            >
              Compare
            </button>
            <button
              type="button"
              onClick={onAddToBag}
              className={cn(
                action,
                "bg-gold text-white hover:bg-black sm:px-6"
              )}
            >
              Add to Bag
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
