import "server-only"
import prisma from "../../../../../lib/prisma"
import { requireAdmin } from "../../_server/require-admin"

export type AdminOverview = {
  watches: number
  live: number
  drafts: number
  soldOut: number
  brands: number
  users: number
  suspended: number
}

export async function getAdminOverview(): Promise<AdminOverview> {
  await requireAdmin()
  const [watches, live, soldOut, brands, users, suspended] = await Promise.all([
    prisma.watch.count(),
    prisma.watch.count({ where: { isActive: true } }),
    prisma.watch.count({ where: { stock: 0 } }),
    prisma.brand.count(),
    prisma.user.count(),
    prisma.user.count({
      where: { role: "CUSTOMER", suspendedAt: { not: null } },
    }),
  ])
  return {
    watches,
    live,
    drafts: watches - live,
    soldOut,
    brands,
    users,
    suspended,
  }
}
