import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/app/(auth)/_utils/session"

import { OrdersView } from "@/components/orders/orders-view"

import { getOrdersPage } from "./_data/orders"
import { showSchema, statusFilterSchema } from "./_utils/orders-schema"

export const metadata: Metadata = {
  title: "Your Orders — XII",
  description:
    "Your order register at XII — track insured deliveries and review every timepiece you've acquired.",
  robots: { index: false, follow: false },
}

export default async function OrdersPage({
  searchParams,
}: PageProps<"/orders">) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const params = await searchParams
  const page = await getOrdersPage(user.id, {
    show: showSchema.parse(params.show),
    status: statusFilterSchema.parse(params.status),
  })

  return <OrdersView {...page} />
}
