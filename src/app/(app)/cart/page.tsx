import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/(auth)/_utils/session"

import { CartView } from "@/components/cart/cart-view"

import { getCartPage } from "./_data/cart"

export const metadata: Metadata = {
  title: "The Bag — XII",
  description:
    "Review the timepieces in your bag at XII — adjust quantities, save for later and proceed to checkout.",
  robots: { index: false, follow: false },
}

export default async function CartPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const page = await getCartPage(user.id)
  return <CartView {...page} />
}
