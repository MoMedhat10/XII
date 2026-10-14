import type { Metadata } from "next"

import {
  WishlistView,
  type WishlistItem,
} from "@/components/wishlist/wishlist-view"

export const metadata: Metadata = {
  title: "Saved Pieces — XII",
  description:
    "Your private register of saved timepieces at XII — review, compare and move them to your bag.",
  robots: { index: false, follow: false },
}

// Static placeholder data until the wishlist is wired to the database.
const items: WishlistItem[] = [
  {
    id: "1",
    name: "Royal Oak Perpetual Calendar",
    model: "REF. 26574ST",
    brand: "Audemars Piguet",
    price: 84500,
    stock: 5,
    available: true,
    saved: "2 days ago",
    inBag: false,
  },
  {
    id: "2",
    name: "Nautilus Chronograph",
    model: "REF. 5980/1A",
    brand: "Patek Philippe",
    price: 112000,
    stock: 2,
    available: true,
    saved: "1 week ago",
    inBag: true,
  },
  {
    id: "3",
    name: "Speedmaster Moonwatch",
    model: "REF. 310.30.42",
    brand: "Omega",
    price: 7200,
    stock: 14,
    available: true,
    saved: "3 weeks ago",
    inBag: false,
  },
  {
    id: "4",
    name: "Daytona Cosmograph",
    model: "REF. 116500LN",
    brand: "Rolex",
    price: 36800,
    stock: 0,
    available: false,
    saved: "1 month ago",
    inBag: false,
  },
]

export default async function WishlistPage() {
  // TODO: remove — simulates a slow fetch so loading.tsx can be checked.
  await new Promise((resolve) => setTimeout(resolve, 2500))

  return <WishlistView items={items} />
}
