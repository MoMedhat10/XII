import type { Metadata } from "next"
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query"

import { OrdersManager } from "@/components/dashboard/orders/orders-manager"

import { requireAdmin } from "../../_server/require-admin"
import { getOrderPage } from "./_data/orders"
import { orderFiltersSchema } from "./_utils/order-schema"
import { orderKeys } from "./_utils/keys"

export const metadata: Metadata = {
  title: "Orders — XII Admin",
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await requireAdmin()
  const filters = orderFiltersSchema.parse(await searchParams)

  // one client per request: a shared one would leak data between users
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => getOrderPage(filters),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersManager />
    </HydrationBoundary>
  )
}
