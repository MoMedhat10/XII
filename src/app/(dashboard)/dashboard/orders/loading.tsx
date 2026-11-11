import { OrdersHeader } from "@/components/dashboard/orders/orders-header"
import { OrdersLoading } from "@/components/dashboard/orders/orders-states"

export default function Loading() {
  return (
    <>
      <OrdersHeader summary={null} />
      <OrdersLoading />
    </>
  )
}
