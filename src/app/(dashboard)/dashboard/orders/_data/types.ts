import type { OrderStatus } from "@/app/generated/prisma/enums"

/** The account that placed an order; null once that account is deleted. */
export type AdminOrderCustomer = { id: string; username: string } | null

/** One order in the admin list. Dates are ISO strings. */
export type AdminOrderRow = {
  id: string
  /** "XII-3F9A12BC" */
  ref: string
  createdAt: string
  status: OrderStatus
  totalCents: number
  /** snapshot taken at checkout: still there after the account is deleted */
  customerEmail: string
  customer: AdminOrderCustomer
  shipName: string | null
  /** sum of quantities */
  itemCount: number
  firstItemName: string
  /** lines besides the first: "+ 2 more" */
  moreCount: number
  previewUrl: string | null
}

/** Header numbers for every order (they ignore the filters). */
export type AdminOrderSummary = {
  /** PAID: waiting to be shipped */
  toShip: number
  shipped: number
  delivered: number
  cancelled: number
  /** orders placed in the last 30 days that weren't cancelled */
  revenue30dCents: number
}

export type AdminOrderPage = {
  orders: AdminOrderRow[]
  /** orders matching the filters */
  total: number
  /** 1-based, clamped to 1…pageCount */
  page: number
  pageCount: number
  pageSize: number
  summary: AdminOrderSummary
}

export type AdminOrderLine = {
  id: string
  watchId: string
  name: string
  model: string
  brand: string
  quantity: number
  unitPriceCents: number
  lineTotalCents: number
  imageUrl: string | null
}

export type AdminOrderDetail = {
  order: AdminOrderRow & {
    updatedAt: string
    shippedAt: string | null
    deliveredAt: string | null
    cancelledAt: string | null
    carrier: string | null
    trackingNumber: string | null
  }
  items: AdminOrderLine[]
  /** null for orders placed before checkout stored an address */
  shipping: { name: string; phone: string | null; lines: string[] } | null
  /** the next steps this order can take (status only moves forward) */
  allowed: { ship: boolean; deliver: boolean; cancel: boolean }
}
