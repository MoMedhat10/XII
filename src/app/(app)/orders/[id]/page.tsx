import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/app/(auth)/_utils/session"

import { OrderDetailView } from "@/components/orders/order-detail-view"

import { getOrderDetail } from "../_data/orders"

export async function generateMetadata({
  params,
}: PageProps<"/orders/[id]">): Promise<Metadata> {
  const user = await getCurrentUser()
  const order = user ? await getOrderDetail((await params).id, user.id) : null
  return {
    title: order ? `Order ${order.ref} — XII` : "Order not found — XII",
    robots: { index: false, follow: false },
  }
}

export default async function OrderPage({ params }: PageProps<"/orders/[id]">) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const order = await getOrderDetail((await params).id, user.id)
  if (!order) notFound()

  return <OrderDetailView order={order} />
}
