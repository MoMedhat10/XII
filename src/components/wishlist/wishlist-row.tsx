import Link from "next/link"

import type { WishlistItem } from "@/app/(app)/wishlist/_data/types"
import {
  flagFor,
  isAvailable,
} from "@/app/(app)/wishlist/_utils/wishlist-items"
import { ImageFallback } from "@/components/image-fallback"
import { cn } from "@/lib/utils"

import { WishlistCheckbox } from "./wishlist-checkbox"
import { rowLayout } from "./wishlist-layout"
import { formatPrice } from "../dashboard/watches/watch-utils"

export function WishlistRow({
  item,
  selected,
  disabled,
  onToggle,
  onAddToBag,
  onRemove,
}: {
  item: WishlistItem
  selected: boolean
  /** an action is in flight */
  disabled: boolean
  onToggle: () => void
  onAddToBag: () => void
  onRemove: () => void
}) {
  const flag = flagFor(item)
  const status = isAvailable(item) ? "In stock" : "Unavailable"

  return (
    <div
      className={cn(
        rowLayout,
        "border-b-2 border-surface-variant px-4 py-5 transition-colors hover:bg-card",
        selected && "bg-card"
      )}
    >
      <WishlistCheckbox
        checked={selected}
        label={`Select ${item.name}`}
        onClick={onToggle}
      />
      <ImageFallback
        fill
        unoptimized
        sizes="88px"
        src={item.image?.url}
        alt={item.image?.alt || item.name}
        label="Photo"
        wrapperClassName="aspect-square border-4"
        className="object-cover"
      />
      <div className="min-w-0">
        <span className="block font-sans text-xs leading-5 tracking-[0.1em] text-muted-foreground uppercase sm:text-sm">
          {item.model} · saved {item.savedLabel}
        </span>
        <Link
          href={`/watches/${item.id}`}
          className="block font-heading text-xl leading-7 font-semibold transition-colors hover:text-gold sm:text-2xl sm:leading-8 xl:text-[28px] xl:leading-[34px]"
        >
          {item.name}
        </Link>
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
        {formatPrice(item.priceCents)}
      </span>
      <div className="flex gap-2 max-xl:col-span-3 xl:justify-end">
        <button
          type="button"
          disabled={disabled || item.inBag || !isAvailable(item)}
          onClick={onAddToBag}
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
          disabled={disabled}
          onClick={onRemove}
          className="size-11 shrink-0 cursor-pointer border-4 bg-background font-heading text-base font-bold transition-colors hover:bg-foreground hover:text-black disabled:cursor-default disabled:opacity-60"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
