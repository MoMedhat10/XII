"use client"

import { useOptimistic, useState, useTransition } from "react"
import { toast } from "sonner"

import { addToBag } from "../../cart/_actions/cart"
import { removeFavorites } from "../_actions/wishlist"
import type { WishlistItem, WishlistPage } from "../_data/types"
import { isAvailable, sumCents } from "../_utils/wishlist-items"

type OptimisticChange =
  { type: "remove"; ids: string[] } | { type: "bag"; ids: string[] }

function applyChange(items: WishlistItem[], change: OptimisticChange) {
  if (change.type === "remove") {
    return items.filter((i) => !change.ids.includes(i.id))
  }
  return items.map((i) =>
    change.ids.includes(i.id) && isAvailable(i) ? { ...i, inBag: true } : i
  )
}

/** Rows, header totals, selection and the Remove / Add to Bag actions. */
export function useWishlist({
  items: serverItems,
  count: serverCount,
  totalValueCents: serverTotalCents,
}: WishlistPage) {
  // Server props are the source of truth; actions call refresh() to update
  // them. The optimistic layer only bridges the wait.
  const [items, applyOptimistic] = useOptimistic(serverItems, applyChange)
  const [pending, startTransition] = useTransition()
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Hidden rows count against the header totals while a remove is in flight.
  const hidden = serverItems.filter((s) => !items.some((i) => i.id === s.id))
  const count = serverCount - hidden.length
  const totalCents = serverTotalCents - sumCents(hidden)

  // Ignore selections whose rows are gone (removed here or in another tab).
  const selItems = items.filter((i) => selectedIds.includes(i.id))
  const selected = selItems.map((i) => i.id)
  const allSelected = items.length > 0 && selItems.length === items.length

  const deselect = (ids: string[]) =>
    setSelectedIds((s) => s.filter((id) => !ids.includes(id)))

  const toggle = (id: string) =>
    setSelectedIds((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id]
    )

  const toggleAll = () =>
    setSelectedIds(allSelected ? [] : items.map((i) => i.id))

  const clearSelection = () => setSelectedIds([])

  const remove = (ids: string[]) =>
    startTransition(async () => {
      applyOptimistic({ type: "remove", ids })
      const res = await removeFavorites({ watchIds: ids })
      if (!res.success) return void toast.error(res.message)
      deselect(ids)
      toast.success(res.message)
    })

  const bag = (ids: string[]) => {
    const addIds = items
      .filter((i) => ids.includes(i.id) && isAvailable(i) && !i.inBag)
      .map((i) => i.id)
    if (!addIds.length) {
      toast.error(
        "Nothing to add — those pieces are unavailable or already in your bag"
      )
      return
    }
    startTransition(async () => {
      applyOptimistic({ type: "bag", ids: addIds })
      const res = await addToBag({ watchIds: addIds })
      if (!res.success) return void toast.error(res.message)
      deselect(addIds)
      toast.success(res.message)
    })
  }

  return {
    items,
    count,
    totalCents,
    selItems,
    selected,
    allSelected,
    pending,
    toggle,
    toggleAll,
    clearSelection,
    remove,
    bag,
  }
}
