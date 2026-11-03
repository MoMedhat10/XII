import type { WishlistItem } from "../_data/types"

/** Inactive watches never reach the page, so stock alone decides. */
export const isAvailable = (item: WishlistItem) => item.stock > 0

/** The gold badge under the name, or null when there's nothing to flag. */
export function flagFor(item: WishlistItem) {
  if (!isAvailable(item)) return "Sold out"
  if (item.stock <= 3) return `Only ${item.stock} left`
  return null
}

export const sumCents = (items: WishlistItem[]) =>
  items.reduce((sum, i) => sum + i.priceCents, 0)
