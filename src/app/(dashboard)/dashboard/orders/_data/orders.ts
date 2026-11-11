import "server-only"
import type { OrderStatus, Prisma } from "@/app/generated/prisma/client"
import {
  formatShipping,
  shippingSelect,
} from "@/app/(app)/orders/_utils/order-address"
import { orderRef } from "@/app/(app)/orders/_utils/order-format"
import prisma from "../../../../../../lib/prisma"
import { getPublicUrl } from "../../../../../../lib/storage"
import { requireAdmin } from "../../../_server/require-admin"
import { escapeLike } from "../../../_utils/search"
import { ORDERS_PAGE_SIZE, type OrderFilters } from "../_utils/order-schema"
import type {
  AdminOrderDetail,
  AdminOrderPage,
  AdminOrderRow,
  AdminOrderSummary,
} from "./types"

const DAY_MS = 24 * 60 * 60 * 1000
const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 } as const

// Orders show what was bought, so lines come from the OrderItem snapshot,
// never the live Watch (it may be renamed, repriced or deleted).
export const orderRowSelect = {
  id: true,
  createdAt: true,
  status: true,
  totalCents: true,
  customerEmail: true,
  shipName: true,
  user: { select: { id: true, username: true } },
  orderItems: {
    select: { watchName: true, quantity: true, imageKey: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.OrderSelect

type OrderRow = Prisma.OrderGetPayload<{ select: typeof orderRowSelect }>

export const toOrderRow = (o: OrderRow): AdminOrderRow => {
  const first = o.orderItems[0]
  return {
    id: o.id,
    ref: orderRef(o.id),
    createdAt: o.createdAt.toISOString(),
    status: o.status,
    totalCents: o.totalCents,
    customerEmail: o.customerEmail,
    customer: o.user,
    shipName: o.shipName,
    itemCount: o.orderItems.reduce((n, i) => n + i.quantity, 0),
    firstItemName: first?.watchName ?? "—",
    moreCount: Math.max(o.orderItems.length - 1, 0),
    previewUrl: first?.imageKey ? getPublicUrl(first.imageKey) : null,
  }
}

/**
 * "XII-3F9A12BC", "xii-3f9a" or "3f9a12bc" → "3f9a12bc", the start of the
 * order id. Null when the term can't be part of a ref.
 */
function refPrefix(q: string) {
  const hex = q.replace(/^xii-?/i, "").toLowerCase()
  return /^[0-9a-f-]{2,36}$/.test(hex) ? hex : null
}

function filtersWhere({ q, status, range }: OrderFilters) {
  const term = escapeLike(q)
  const prefix = refPrefix(q)
  const where: Prisma.OrderWhereInput = {
    ...(status !== "all" && { status }),
    ...(range !== "all" && {
      createdAt: { gte: new Date(Date.now() - RANGE_DAYS[range] * DAY_MS) },
    }),
  }
  if (term) {
    where.OR = [
      ...(prefix ? [{ id: { startsWith: prefix } }] : []),
      { customerEmail: { contains: term, mode: "insensitive" } },
      { shipName: { contains: term, mode: "insensitive" } },
      { user: { username: { contains: term, mode: "insensitive" } } },
      {
        orderItems: {
          some: {
            OR: [
              { watchName: { contains: term, mode: "insensitive" } },
              { brandName: { contains: term, mode: "insensitive" } },
            ],
          },
        },
      },
    ]
  }
  return where
}

// id breaks ties so rows never jump between pages
const ORDER_BY: Record<
  OrderFilters["sort"],
  Prisma.OrderOrderByWithRelationInput[]
> = {
  newest: [{ createdAt: "desc" }, { id: "desc" }],
  oldest: [{ createdAt: "asc" }, { id: "asc" }],
  "total-high": [{ totalCents: "desc" }, { createdAt: "desc" }, { id: "desc" }],
  "total-low": [{ totalCents: "asc" }, { createdAt: "desc" }, { id: "desc" }],
}

async function getSummary(): Promise<AdminOrderSummary> {
  const [groups, revenue] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.aggregate({
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: new Date(Date.now() - 30 * DAY_MS) },
      },
      _sum: { totalCents: true },
    }),
  ])
  const count = (s: OrderStatus) =>
    groups.find((g) => g.status === s)?._count._all ?? 0
  return {
    toShip: count("PAID"),
    shipped: count("SHIPPED"),
    delivered: count("DELIVERED"),
    cancelled: count("CANCELLED"),
    revenue30dCents: revenue._sum.totalCents ?? 0,
  }
}

export async function getOrderPage(
  filters: OrderFilters
): Promise<AdminOrderPage> {
  // checked here, not only in the layout: layouts don't re-run on client
  // navigation
  await requireAdmin()
  const where = filtersWhere(filters)
  const pageSize = ORDERS_PAGE_SIZE

  const [total, summary] = await Promise.all([
    prisma.order.count({ where }),
    getSummary(),
  ])
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  // e.g. ?page=99, or a filter change shrank the result
  const page = Math.min(filters.page, pageCount)

  const rows = await prisma.order.findMany({
    where,
    select: orderRowSelect,
    orderBy: ORDER_BY[filters.sort],
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  return {
    orders: rows.map(toOrderRow),
    total,
    page,
    pageCount,
    pageSize,
    summary,
  }
}

const iso = (d: Date | null) => d?.toISOString() ?? null

export async function getOrderDetail(
  id: string
): Promise<AdminOrderDetail | null> {
  await requireAdmin()
  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      ...orderRowSelect,
      ...shippingSelect,
      updatedAt: true,
      shippedAt: true,
      deliveredAt: true,
      cancelledAt: true,
      carrier: true,
      trackingNumber: true,
      orderItems: {
        select: {
          id: true,
          watchId: true,
          watchName: true,
          watchModel: true,
          brandName: true,
          quantity: true,
          unitPriceCents: true,
          imageKey: true,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
    },
  })
  if (!order) return null

  return {
    order: {
      ...toOrderRow(order),
      updatedAt: order.updatedAt.toISOString(),
      shippedAt: iso(order.shippedAt),
      deliveredAt: iso(order.deliveredAt),
      cancelledAt: iso(order.cancelledAt),
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
    },
    items: order.orderItems.map((i) => ({
      id: i.id,
      watchId: i.watchId,
      name: i.watchName,
      model: i.watchModel,
      brand: i.brandName,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
      lineTotalCents: i.unitPriceCents * i.quantity,
      imageUrl: i.imageKey ? getPublicUrl(i.imageKey) : null,
    })),
    shipping: formatShipping(order),
    allowed: {
      ship: order.status === "PAID",
      deliver: order.status === "SHIPPED",
      cancel: order.status === "PAID",
    },
  }
}
