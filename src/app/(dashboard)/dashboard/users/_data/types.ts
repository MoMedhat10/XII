import type { OrderStatus, Role } from "@/app/generated/prisma/enums"

/** One account in the admin users list. Dates are ISO strings. */
export type AdminUserRow = {
  id: string
  username: string
  email: string
  role: Role
  joinedAt: string
  verifiedAt: string | null
  suspendedAt: string | null
  orderCount: number
  wishlistCount: number
  cartCount: number
  /** paid + shipped + delivered (cancelled orders don't count) */
  lifetimeCents: number
  lastOrderAt: string | null
}

/** Header numbers for the whole user base (they ignore the filters). */
export type AdminUserSummary = {
  users: number
  customers: number
  admins: number
  /** customers only: admins can't be suspended */
  suspended: number
  newLast30d: number
}

export type AdminUserPage = {
  users: AdminUserRow[]
  /** users matching the filters */
  total: number
  /** 1-based, clamped to 1…pageCount */
  page: number
  pageCount: number
  pageSize: number
  summary: AdminUserSummary
  /** the signed-in admin: their own row gets no destructive actions */
  viewerId: string
}

export type AdminUserOrder = {
  id: string
  ref: string
  createdAt: string
  status: OrderStatus
  totalCents: number
  itemCount: number
}

export type AdminUserDetail = {
  user: AdminUserRow
  ordersByStatus: Record<OrderStatus, number>
  /** newest first, at most 5 */
  recentOrders: AdminUserOrder[]
  wishlist: {
    count: number
    /** newest first, at most 6 */
    items: {
      watchId: string
      name: string
      brand: string
      imageUrl: string | null
    }[]
  }
  cart: {
    lines: {
      watchId: string
      name: string
      brand: string
      quantity: number
      /** the watch's current price: carts don't snapshot prices */
      unitPriceCents: number
    }[]
    totalCents: number
  }
  sessions: {
    /** sessions that haven't expired yet */
    active: number
    lastSignInAt: string | null
  }
}
