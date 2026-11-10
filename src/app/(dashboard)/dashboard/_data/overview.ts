import "server-only"
import prisma from "../../../../../lib/prisma"
import { requireAdmin } from "../../_server/require-admin"

export type AdminOverview = {
  watches: number
  live: number
  drafts: number
  soldOut: number
  brands: number
}

export async function getAdminOverview(): Promise<AdminOverview> {
  await requireAdmin()
  const [watches, live, soldOut, brands] = await Promise.all([
    prisma.watch.count(),
    prisma.watch.count({ where: { isActive: true } }),
    prisma.watch.count({ where: { stock: 0 } }),
    prisma.brand.count(),
  ])
  return { watches, live, drafts: watches - live, soldOut, brands }
}
