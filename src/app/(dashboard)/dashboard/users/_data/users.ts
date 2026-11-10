import "server-only"
import type { OrderStatus, Prisma } from "@/app/generated/prisma/client"
import { orderRef } from "@/app/(app)/orders/_utils/order-format"
import prisma from "../../../../../../lib/prisma"
import { getPublicUrl } from "../../../../../../lib/storage"
import { requireAdmin } from "../../../_server/require-admin"
import { escapeLike } from "../../../_utils/search"
import { USERS_PAGE_SIZE, type UserFilters } from "../_utils/user-schema"
import type {
  AdminUserDetail,
  AdminUserPage,
  AdminUserRow,
  AdminUserSummary,
} from "./types"

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

// never passwordHash: rows go to the browser
export const userRowSelect = {
  id: true,
  username: true,
  email: true,
  role: true,
  createdAt: true,
  emailVerifiedAt: true,
  suspendedAt: true,
  _count: { select: { orders: true, favorites: true } },
  cart: { select: { _count: { select: { cartItems: true } } } },
} satisfies Prisma.UserSelect

type UserRow = Prisma.UserGetPayload<{ select: typeof userRowSelect }>
type OrderStats = { lifetimeCents: number; lastOrderAt: Date | null }

const toRow = (u: UserRow, stats?: OrderStats): AdminUserRow => ({
  id: u.id,
  username: u.username,
  email: u.email,
  role: u.role,
  joinedAt: u.createdAt.toISOString(),
  verifiedAt: u.emailVerifiedAt?.toISOString() ?? null,
  suspendedAt: u.suspendedAt?.toISOString() ?? null,
  orderCount: u._count.orders,
  wishlistCount: u._count.favorites,
  cartCount: u.cart?._count.cartItems ?? 0,
  lifetimeCents: stats?.lifetimeCents ?? 0,
  lastOrderAt: stats?.lastOrderAt?.toISOString() ?? null,
})

/**
 * Lifetime spend and last order date for many users in ONE query (not one
 * per row). Cancelled orders don't count toward spend, the same rule as the
 * user's own orders page, but they still count as their last order.
 */
async function orderStatsFor(userIds: string[]) {
  const stats = new Map<string, OrderStats>()
  if (!userIds.length) return stats

  const groups = await prisma.order.groupBy({
    by: ["userId", "status"],
    where: { userId: { in: userIds } },
    _sum: { totalCents: true },
    _max: { createdAt: true },
  })
  for (const g of groups) {
    if (!g.userId) continue
    const s = stats.get(g.userId) ?? { lifetimeCents: 0, lastOrderAt: null }
    if (g.status !== "CANCELLED") s.lifetimeCents += g._sum.totalCents ?? 0
    const last = g._max.createdAt
    if (last && (!s.lastOrderAt || last > s.lastOrderAt)) s.lastOrderAt = last
    stats.set(g.userId, s)
  }
  return stats
}

function filtersWhere({ q, role, status }: UserFilters): Prisma.UserWhereInput {
  const term = escapeLike(q)
  return {
    ...(term && {
      OR: [
        { username: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
      ],
    }),
    ...(role !== "all" && { role: role === "admin" ? "ADMIN" : "CUSTOMER" }),
    ...(status === "verified" && { emailVerifiedAt: { not: null } }),
    ...(status === "unverified" && { emailVerifiedAt: null }),
    ...(status === "suspended" && { suspendedAt: { not: null } }),
  }
}

// id breaks ties so rows never jump between pages
const ORDER_BY: Record<
  UserFilters["sort"],
  Prisma.UserOrderByWithRelationInput[]
> = {
  newest: [{ createdAt: "desc" }, { id: "desc" }],
  oldest: [{ createdAt: "asc" }, { id: "asc" }],
  orders: [
    { orders: { _count: "desc" } },
    { createdAt: "desc" },
    { id: "desc" },
  ],
}

async function getSummary(): Promise<AdminUserSummary> {
  const [users, customers, suspended, newLast30d] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({
      where: { role: "CUSTOMER", suspendedAt: { not: null } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - THIRTY_DAYS_MS) } },
    }),
  ])
  return { users, customers, admins: users - customers, suspended, newLast30d }
}

export async function getUserPage(
  filters: UserFilters
): Promise<AdminUserPage> {
  // checked here, not only in the layout: layouts don't re-run on client
  // navigation
  const admin = await requireAdmin()
  const where = filtersWhere(filters)
  const pageSize = USERS_PAGE_SIZE

  const [total, summary] = await Promise.all([
    prisma.user.count({ where }),
    getSummary(),
  ])
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  // e.g. ?page=99, or the last row of the last page was just deleted
  const page = Math.min(filters.page, pageCount)

  const rows = await prisma.user.findMany({
    where,
    select: userRowSelect,
    orderBy: ORDER_BY[filters.sort],
    skip: (page - 1) * pageSize,
    take: pageSize,
  })
  const stats = await orderStatsFor(rows.map((r) => r.id))

  return {
    users: rows.map((r) => toRow(r, stats.get(r.id))),
    total,
    page,
    pageCount,
    pageSize,
    summary,
    viewerId: admin.id,
  }
}

const EMPTY_STATUS_COUNTS: Record<OrderStatus, number> = {
  PAID: 0,
  SHIPPED: 0,
  DELIVERED: 0,
  CANCELLED: 0,
}

export async function getUserDetail(
  id: string
): Promise<AdminUserDetail | null> {
  await requireAdmin()
  const user = await prisma.user.findUnique({
    where: { id },
    select: userRowSelect,
  })
  if (!user) return null

  const [stats, recent, favorites, cartItems, sessions, statusGroups] =
    await Promise.all([
      orderStatsFor([id]),
      prisma.order.findMany({
        where: { userId: id },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 5,
        select: {
          id: true,
          createdAt: true,
          status: true,
          totalCents: true,
          _count: { select: { orderItems: true } },
        },
      }),
      prisma.favoriteWatch.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          watch: {
            select: {
              id: true,
              name: true,
              brand: { select: { name: true } },
              images: {
                select: { key: true },
                orderBy: { sortOrder: "asc" },
                take: 1,
              },
            },
          },
        },
      }),
      prisma.cartItem.findMany({
        where: { cart: { userId: id } },
        orderBy: { createdAt: "asc" },
        select: {
          quantity: true,
          watch: {
            select: {
              id: true,
              name: true,
              priceCents: true,
              brand: { select: { name: true } },
            },
          },
        },
      }),
      prisma.session.aggregate({
        where: { userId: id, expiresAt: { gt: new Date() } },
        _count: { _all: true },
        _max: { createdAt: true },
      }),
      prisma.order.groupBy({
        by: ["status"],
        where: { userId: id },
        _count: { _all: true },
      }),
    ])

  const ordersByStatus = { ...EMPTY_STATUS_COUNTS }
  for (const g of statusGroups) ordersByStatus[g.status] = g._count._all

  const lines = cartItems.map((item) => ({
    watchId: item.watch.id,
    name: item.watch.name,
    brand: item.watch.brand.name,
    quantity: item.quantity,
    unitPriceCents: item.watch.priceCents,
  }))

  return {
    user: toRow(user, stats.get(id)),
    ordersByStatus,
    recentOrders: recent.map((o) => ({
      id: o.id,
      ref: orderRef(o.id),
      createdAt: o.createdAt.toISOString(),
      status: o.status,
      totalCents: o.totalCents,
      itemCount: o._count.orderItems,
    })),
    wishlist: {
      count: user._count.favorites,
      items: favorites.map(({ watch }) => ({
        watchId: watch.id,
        name: watch.name,
        brand: watch.brand.name,
        imageUrl: watch.images[0] ? getPublicUrl(watch.images[0].key) : null,
      })),
    },
    cart: {
      lines,
      totalCents: lines.reduce(
        (sum, l) => sum + l.quantity * l.unitPriceCents,
        0
      ),
    },
    sessions: {
      active: sessions._count._all,
      lastSignInAt: sessions._max.createdAt?.toISOString() ?? null,
    },
  }
}
