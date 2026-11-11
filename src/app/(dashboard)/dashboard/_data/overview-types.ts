import type { AdminOrderRow } from "../orders/_data/types"
import type { OverviewRange } from "../_utils/overview-schema"

/** A number for the chosen period and the same-length period before it. */
export type Kpi = { value: number; previous: number }

export type OverviewDay = {
  /** UTC day, "2026-11-11" */
  date: string
  revenueCents: number
  orders: number
}

export type OverviewWatchRef = { id: string; name: string; brand: string }

export type OverviewSeller = {
  /** watchId, or the brand name for brands */
  key: string
  name: string
  /** the brand for a watch; null for a brand row */
  brand: string | null
  units: number
  revenueCents: number
  imageUrl: string | null
}

export type AdminOverview = {
  range: OverviewRange
  days: number
  kpis: {
    /** orders placed in the period that weren't cancelled */
    revenueCents: Kpi
    orders: Kpi
    avgOrderCents: Kpi
    newCustomers: Kpi
  }
  /** one row per day, oldest first, zero-filled */
  daily: OverviewDay[]
  attention: {
    toShip: number
    /** whole days the oldest PAID order has waited; null when none */
    oldestWaitingDays: number | null
    soldOut: { count: number; watches: OverviewWatchRef[] }
    lowStock: (OverviewWatchRef & { stock: number })[]
    /** customers who signed up over a day ago and never verified */
    unverified: number
  }
  topWatches: OverviewSeller[]
  topBrands: OverviewSeller[]
  /** all time: watches saved most often */
  mostWanted: (OverviewWatchRef & {
    wishlists: number
    inCarts: number
    imageUrl: string | null
  })[]
  recentOrders: AdminOrderRow[]
  recentSignups: {
    id: string
    username: string
    email: string
    joinedAt: string
    verifiedAt: string | null
  }[]
  catalog: {
    watches: number
    live: number
    drafts: number
    soldOut: number
    brands: number
    users: number
    suspended: number
  }
}
