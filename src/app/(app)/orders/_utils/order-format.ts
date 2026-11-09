import type { OrderStatus } from "@/app/generated/prisma/enums"

/** In display order: the filter chips and the status track follow it. */
export const ORDER_STATUSES = [
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const satisfies readonly OrderStatus[]

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
}

/** Short reference shown to customers, e.g. "XII-3F9A12BC". */
export const orderRef = (id: string) => `XII-${id.slice(0, 8).toUpperCase()}`

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

/** "9 Nov 2026" */
export const formatOrderDate = (date: Date) => dateFormat.format(date)
