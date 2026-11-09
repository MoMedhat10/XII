import "server-only"
import { cache } from "react"
import type { OrderStatus, Prisma } from "@/app/generated/prisma/client"
import prisma from "../../../../../lib/prisma"
import { getPublicUrl } from "../../../../../lib/storage"
import { formatOrderDate, orderRef } from "../_utils/order-format"
import {
  ORDERS_MAX_SHOW,
  ORDERS_PAGE_SIZE,
  orderIdSchema,
} from "../_utils/orders-schema"
import type {
  OrderCounts,
  OrderDetail,
  OrderImage,
  OrdersPage,
  OrderSummary,
} from "./types"

// Orders show what was bought, so everything here reads the OrderItem
// snapshot, never the live Watch (it may be renamed, repriced or withdrawn).
const toImage = (key: string | null, alt: string): OrderImage =>
  key ? { url: getPublicUrl(key), alt } : null

const summarySelect = {
  id: true,
  status: true,
  createdAt: true,
  totalCents: true,
  orderItems: {
    select: { watchName: true, quantity: true, imageKey: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  },
} satisfies Prisma.OrderSelect

type SummaryRow = Prisma.OrderGetPayload<{ select: typeof summarySelect }>

const toSummary = (o: SummaryRow): OrderSummary => {
  const first = o.orderItems[0]
  return {
    id: o.id,
    ref: orderRef(o.id),
    status: o.status,
    placedLabel: formatOrderDate(o.createdAt),
    totalCents: o.totalCents,
    itemCount: o.orderItems.reduce((n, i) => n + i.quantity, 0),
    preview: first ? toImage(first.imageKey, first.watchName) : null,
    firstItemName: first?.watchName ?? "—",
    moreCount: Math.max(o.orderItems.length - 1, 0),
  }
}

/** The newest `show` orders, optionally filtered, plus per-status counts. */
export async function getOrdersPage(
  userId: string,
  { show, status }: { show: number; status: OrderStatus | null }
): Promise<OrdersPage> {
  const [rows, groups] = await Promise.all([
    prisma.order.findMany({
      where: { userId, ...(status && { status }) },
      select: summarySelect,
      // id breaks ties between orders placed in the same millisecond
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      // one extra row tells us whether there's more
      take: show + 1,
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
      _sum: { totalCents: true },
    }),
  ])

  const counts: OrderCounts = {
    ALL: 0,
    PAID: 0,
    SHIPPED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  }
  let lifetimeCents = 0
  for (const g of groups) {
    counts[g.status] = g._count._all
    counts.ALL += g._count._all
    if (g.status !== "CANCELLED") lifetimeCents += g._sum.totalCents ?? 0
  }

  // `show` is capped, so past the cap there is no next step to link to
  const hasMore = rows.length > show && show < ORDERS_MAX_SHOW
  return {
    orders: rows.slice(0, show).map(toSummary),
    status,
    counts,
    lifetimeCents,
    nextShow: hasMore ? show + ORDERS_PAGE_SIZE : null,
  }
}

/**
 * One of the user's orders, or null when the id is malformed, unknown or
 * belongs to someone else (all look the same, so ids can't be probed).
 * Cached so generateMetadata and the page share one query.
 */
export const getOrderDetail = cache(
  async (orderId: string, userId: string): Promise<OrderDetail | null> => {
    if (!orderIdSchema.safeParse(orderId).success) return null

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        customerEmail: true,
        totalCents: true,
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
      id: order.id,
      ref: orderRef(order.id),
      status: order.status,
      placedLabel: formatOrderDate(order.createdAt),
      updatedLabel: formatOrderDate(order.updatedAt),
      customerEmail: order.customerEmail,
      totalCents: order.totalCents,
      canCancel: order.status === "PAID",
      items: order.orderItems.map((i) => ({
        id: i.id,
        watchId: i.watchId,
        name: i.watchName,
        model: i.watchModel,
        brand: i.brandName,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
        lineTotalCents: i.unitPriceCents * i.quantity,
        image: toImage(i.imageKey, i.watchName),
      })),
    }
  }
)
