import type { OrderStatus } from "@/app/generated/prisma/enums"

export type OrderImage = { url: string; alt: string } | null

export type OrderSummary = {
  id: string
  /** "XII-3F9A12BC" */
  ref: string
  status: OrderStatus
  /** "9 Nov 2026", formatted on the server */
  placedLabel: string
  totalCents: number
  /** sum of quantities */
  itemCount: number
  /** first line's snapshot image */
  preview: OrderImage
  firstItemName: string
  /** other lines besides the first: "+ 2 more" */
  moreCount: number
}

export type OrderCounts = Record<OrderStatus | "ALL", number>

export type OrdersPage = {
  orders: OrderSummary[]
  /** active `?status=` filter, null for all */
  status: OrderStatus | null
  counts: OrderCounts
  /** total of every order that wasn't cancelled */
  lifetimeCents: number
  /** `?show=` value for the next step, or null when everything is shown */
  nextShow: number | null
}

/** One line, read from the order's snapshot, never the live watch. */
export type OrderLine = {
  id: string
  watchId: string
  name: string
  model: string
  brand: string
  quantity: number
  unitPriceCents: number
  lineTotalCents: number
  image: OrderImage
}

export type OrderDetail = {
  id: string
  ref: string
  status: OrderStatus
  placedLabel: string
  updatedLabel: string
  customerEmail: string
  totalCents: number
  items: OrderLine[]
  canCancel: boolean
  /** null for orders placed before checkout stored an address */
  shipping: { name: string; phone: string | null; lines: string[] } | null
  /** set by an admin when the order ships */
  tracking: { carrier: string; number: string } | null
  shippedLabel: string | null
  deliveredLabel: string | null
}
