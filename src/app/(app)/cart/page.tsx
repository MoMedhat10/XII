import type { Metadata } from "next"

import type { CartItem } from "@/components/cart/cart-types"
import { CartView } from "@/components/cart/cart-view"

export const metadata: Metadata = {
  title: "The Bag — XII",
  description:
    "Review the timepieces in your bag at XII — adjust quantities, save for later and proceed to checkout.",
  robots: { index: false, follow: false },
}

// Static placeholder data until the cart is wired to the database.
const items: CartItem[] = [
  {
    id: "1",
    name: "Tourbillon II",
    ref: "Ref. 207",
    spec: "42 mm · Titanium",
    price: 48000,
    qty: 1,
    max: 1,
    flag: "Only 1 left",
  },
  {
    id: "2",
    name: "Chronograph I",
    ref: "Ref. 101",
    spec: "41 mm · Steel",
    price: 12400,
    qty: 1,
    max: 2,
  },
  {
    id: "3",
    name: "Automatic III",
    ref: "Ref. 312",
    spec: "39 mm · Black steel",
    price: 8900,
    qty: 1,
    max: 2,
    flag: "Price dropped $400",
  },
]

// Suggestions shown when the bag is empty.
const picks: CartItem[] = [
  {
    id: "4",
    name: "GMT IV",
    ref: "Ref. 412",
    spec: "From wishlist",
    price: 12400,
    qty: 1,
    max: 2,
  },
  {
    id: "5",
    name: "Skeleton V",
    ref: "Ref. 415",
    spec: "From wishlist",
    price: 21500,
    qty: 1,
    max: 2,
  },
  {
    id: "6",
    name: "Moonphase VI",
    ref: "Ref. 418",
    spec: "From wishlist",
    price: 16800,
    qty: 1,
    max: 2,
  },
]

export default async function CartPage() {
  // TODO: remove — simulates a slow fetch so loading.tsx can be checked.
  await new Promise((resolve) => setTimeout(resolve, 2500))

  return <CartView items={items} picks={picks} />
}
