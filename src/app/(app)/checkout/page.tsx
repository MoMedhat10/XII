import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/(auth)/_utils/session"

import { CheckoutView } from "@/components/checkout/checkout-view"

import { getCheckoutPage } from "./_data/checkout"

export const metadata: Metadata = {
  title: "Checkout — XII",
  description:
    "Complete your XII order — insured courier delivery with a certificate of authenticity.",
  robots: { index: false, follow: false },
}

export default async function CheckoutPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const page = await getCheckoutPage(user.id, user.email)
  // empty bag, or a line holds more than is in stock: the bag explains
  if (!page) redirect("/cart") 

  return <CheckoutView {...page} />
}
