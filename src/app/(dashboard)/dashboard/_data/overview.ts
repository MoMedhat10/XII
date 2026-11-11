import "server-only"
import type { Prisma } from "@/app/generated/prisma/client"
import prisma from "../../../../../lib/prisma"
import { getPublicUrl } from "../../../../../lib/storage"
import { requireAdmin } from "../../_server/require-admin"
import { orderRowSelect, toOrderRow } from "../orders/_data/orders"
import { RANGE_DAYS, type OverviewFilters } from "../_utils/overview-schema"
import type { AdminOverview, Kpi, OverviewSeller } from "./overview-types"

const DAY_MS = 24 * 60 * 60 * 1000
const TOP_N = 5
/** "Low on stock": live watches with this many or fewer left (but not 0). */
const LOW_STOCK = 2

const startOfUtcDay = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
const dayKey = (d: Date) => d.toISOString().slice(0, 10)

// Revenue follows the same rule as the rest of the app: cancelled orders
// never count.
const sold = (from: Date, to: Date): Prisma.OrderWhereInput => ({
  status: { not: "CANCELLED" },
  createdAt: { gte: from, lt: to },
})

const kpi = (value: number, previous: number): Kpi => ({ value, previous })

const coverImage = {
  images: {
    select: { key: true },
    orderBy: { sortOrder: "asc" },
    take: 1,
  },
} satisfies Prisma.WatchSelect

/** Top sellers from order lines: snapshot names, so renamed watches still add up. */
function rankSellers(
  lines: {
    watchId: string
    watchName: string
    brandName: string
    quantity: number
    unitPriceCents: number
    imageKey: string | null
  }[]
) {
  const watches = new Map<string, OverviewSeller>()
  const brands = new Map<string, OverviewSeller>()
  for (const l of lines) {
    const revenue = l.quantity * l.unitPriceCents
    const w = watches.get(l.watchId) ?? {
      key: l.watchId,
      name: l.watchName,
      brand: l.brandName,
      units: 0,
      revenueCents: 0,
      imageUrl: l.imageKey ? getPublicUrl(l.imageKey) : null,
    }
    w.units += l.quantity
    w.revenueCents += revenue
    watches.set(l.watchId, w)

    const b = brands.get(l.brandName) ?? {
      key: l.brandName,
      name: l.brandName,
      brand: null,
      units: 0,
      revenueCents: 0,
      imageUrl: null,
    }
    b.units += l.quantity
    b.revenueCents += revenue
    brands.set(l.brandName, b)
  }
  const top = (m: Map<string, OverviewSeller>) =>
    [...m.values()]
      .sort((a, b) => b.revenueCents - a.revenueCents || b.units - a.units)
      .slice(0, TOP_N)
  return { topWatches: top(watches), topBrands: top(brands) }
}

async function getMostWanted() {
  const groups = await prisma.favoriteWatch.groupBy({
    by: ["watchId"],
    _count: { _all: true },
    orderBy: [{ _count: { watchId: "desc" } }, { watchId: "asc" }],
    take: TOP_N,
  })
  const ids = groups.map((g) => g.watchId)
  if (!ids.length) return []

  const [watches, carts] = await Promise.all([
    prisma.watch.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        brand: { select: { name: true } },
        ...coverImage,
      },
    }),
    prisma.cartItem.groupBy({
      by: ["watchId"],
      where: { watchId: { in: ids } },
      _count: { _all: true },
    }),
  ])
  const byId = new Map(watches.map((w) => [w.id, w]))
  return groups.flatMap((g) => {
    const w = byId.get(g.watchId)
    if (!w) return []
    return [
      {
        id: w.id,
        name: w.name,
        brand: w.brand.name,
        wishlists: g._count._all,
        inCarts: carts.find((c) => c.watchId === w.id)?._count._all ?? 0,
        imageUrl: w.images[0] ? getPublicUrl(w.images[0].key) : null,
      },
    ]
  })
}

export async function getOverview({
  range,
}: OverviewFilters): Promise<AdminOverview> {
  // checked here, not only in the layout: layouts don't re-run on client
  // navigation
  await requireAdmin()

  // `days` whole UTC days ending today, and the same length before that
  const days = RANGE_DAYS[range]
  const now = new Date()
  const end = new Date(startOfUtcDay(now).getTime() + DAY_MS)
  const start = new Date(end.getTime() - days * DAY_MS)
  const prevStart = new Date(start.getTime() - days * DAY_MS)
  const customer = (from: Date, to: Date): Prisma.UserWhereInput => ({
    role: "CUSTOMER",
    createdAt: { gte: from, lt: to },
  })
  const watchRef = {
    id: true,
    name: true,
    brand: { select: { name: true } },
  } satisfies Prisma.WatchSelect

  const [
    current,
    previous,
    newCustomers,
    prevCustomers,
    periodOrders,
    lines,
    toShip,
    oldestPaid,
    soldOutCount,
    soldOutWatches,
    lowStock,
    unverified,
    mostWanted,
    recentOrders,
    recentSignups,
    catalog,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: sold(start, end),
      _sum: { totalCents: true },
      _count: { _all: true },
    }),
    prisma.order.aggregate({
      where: sold(prevStart, start),
      _sum: { totalCents: true },
      _count: { _all: true },
    }),
    prisma.user.count({ where: customer(start, end) }),
    prisma.user.count({ where: customer(prevStart, start) }),
    prisma.order.findMany({
      where: sold(start, end),
      select: { createdAt: true, totalCents: true },
    }),
    prisma.orderItem.findMany({
      where: { order: sold(start, end) },
      select: {
        watchId: true,
        watchName: true,
        brandName: true,
        quantity: true,
        unitPriceCents: true,
        imageKey: true,
      },
    }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.findFirst({
      where: { status: "PAID" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    prisma.watch.count({ where: { isActive: true, stock: 0 } }),
    prisma.watch.findMany({
      where: { isActive: true, stock: 0 },
      select: watchRef,
      orderBy: { updatedAt: "desc" },
      take: TOP_N,
    }),
    prisma.watch.findMany({
      where: { isActive: true, stock: { gt: 0, lte: LOW_STOCK } },
      select: { ...watchRef, stock: true },
      orderBy: [{ stock: "asc" }, { name: "asc" }],
      take: TOP_N,
    }),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
        emailVerifiedAt: null,
        createdAt: { lt: new Date(now.getTime() - DAY_MS) },
      },
    }),
    getMostWanted(),
    prisma.order.findMany({
      select: orderRowSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: TOP_N,
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        emailVerifiedAt: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: TOP_N,
    }),
    Promise.all([
      prisma.watch.count(),
      prisma.watch.count({ where: { isActive: true } }),
      prisma.watch.count({ where: { stock: 0 } }),
      prisma.brand.count(),
      prisma.user.count(),
      prisma.user.count({
        where: { role: "CUSTOMER", suspendedAt: { not: null } },
      }),
    ]),
  ])

  // one row per day, so quiet days show as gaps instead of disappearing
  const daily = new Map<string, { revenueCents: number; orders: number }>()
  for (let t = start.getTime(); t < end.getTime(); t += DAY_MS) {
    daily.set(dayKey(new Date(t)), { revenueCents: 0, orders: 0 })
  }
  for (const o of periodOrders) {
    const day = daily.get(dayKey(o.createdAt))
    if (!day) continue
    day.revenueCents += o.totalCents
    day.orders += 1
  }

  const revenue = current._sum.totalCents ?? 0
  const prevRevenue = previous._sum.totalCents ?? 0
  const orders = current._count._all
  const prevOrders = previous._count._all
  const avg = (cents: number, n: number) => (n ? Math.round(cents / n) : 0)
  const ref = (w: { id: string; name: string; brand: { name: string } }) => ({
    id: w.id,
    name: w.name,
    brand: w.brand.name,
  })
  const [watches, live, catalogSoldOut, brands, users, suspended] = catalog

  return {
    range,
    days,
    kpis: {
      revenueCents: kpi(revenue, prevRevenue),
      orders: kpi(orders, prevOrders),
      avgOrderCents: kpi(avg(revenue, orders), avg(prevRevenue, prevOrders)),
      newCustomers: kpi(newCustomers, prevCustomers),
    },
    daily: [...daily].map(([date, d]) => ({ date, ...d })),
    attention: {
      toShip,
      oldestWaitingDays: oldestPaid
        ? Math.floor((now.getTime() - oldestPaid.createdAt.getTime()) / DAY_MS)
        : null,
      soldOut: { count: soldOutCount, watches: soldOutWatches.map(ref) },
      lowStock: lowStock.map((w) => ({ ...ref(w), stock: w.stock })),
      unverified,
    },
    ...rankSellers(lines),
    mostWanted,
    recentOrders: recentOrders.map(toOrderRow),
    recentSignups: recentSignups.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      joinedAt: u.createdAt.toISOString(),
      verifiedAt: u.emailVerifiedAt?.toISOString() ?? null,
    })),
    catalog: {
      watches,
      live,
      drafts: watches - live,
      soldOut: catalogSoldOut,
      brands,
      users,
      suspended,
    },
  }
}
