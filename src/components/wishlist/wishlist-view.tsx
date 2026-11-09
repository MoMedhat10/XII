"use client"

import { toast } from "sonner"

import type { WishlistPage } from "@/app/(app)/wishlist/_data/types"
import { useWishlist } from "@/app/(app)/wishlist/_hooks/use-wishlist"
import { sumCents } from "@/app/(app)/wishlist/_utils/wishlist-items"
import { WISHLIST_PAGE_SIZE } from "@/app/(app)/wishlist/_utils/wishlist-schema"
import { formatCents } from "@/lib/money"
import { cn } from "@/lib/utils"

import { gutter } from "../home/styles"
import { ShowMore } from "../show-more"
import { WishlistEmpty } from "./wishlist-empty"
import { WishlistHeader } from "./wishlist-header"
import { WishlistRow } from "./wishlist-row"
import { WishlistSelectionBar } from "./wishlist-selection-bar"
import { WishlistTableHead } from "./wishlist-table-head"

export function WishlistView(page: WishlistPage) {
  const w = useWishlist(page)

  if (!w.items.length) return <WishlistEmpty />
  return (
    <>
      <section className={cn(gutter, "pt-20 pb-56 sm:pt-28 sm:pb-40")}>
        <WishlistHeader count={w.count} totalCents={w.totalCents} />
        <WishlistTableHead
          allSelected={w.allSelected}
          onToggleAll={w.toggleAll}
        />

        {w.items.map((item) => (
          <WishlistRow
            key={item.id}
            item={item}
            selected={w.selected.includes(item.id)}
            disabled={w.pending}
            onToggle={() => w.toggle(item.id)}
            onAddToBag={() => w.bag([item.id])}
            onRemove={() => w.remove([item.id])}
          />
        ))}

        {page.nextShow && (
          <ShowMore
            href={`?show=${page.nextShow}`}
            shown={w.items.length}
            total={w.count}
            nextCount={Math.min(WISHLIST_PAGE_SIZE, w.count - w.items.length)}
          />
        )}
      </section>

      <WishlistSelectionBar
        items={w.selItems}
        total={formatCents(sumCents(w.selItems))}
        disabled={w.pending}
        onClear={w.clearSelection}
        onRemove={() => w.remove(w.selected)}
        onCompare={() => toast.success(`Comparing ${w.selItems.length} pieces`)}
        onAddToBag={() => w.bag(w.selected)}
      />
    </>
  )
}
