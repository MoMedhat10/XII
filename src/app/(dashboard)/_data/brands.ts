import "server-only"
import type { Prisma } from "@/app/generated/prisma/client"
import prisma from "../../../../lib/prisma"
import { getPublicUrl } from "../../../../lib/storage"
import { requireAdmin } from "../_server/require-admin"
import type { AdminBrand } from "./types"

export const brandSelect = {
  id: true,
  name: true,
  description: true,
  logoKey: true,
  _count: { select: { watches: true } },
} satisfies Prisma.BrandSelect

type BrandRow = Prisma.BrandGetPayload<{ select: typeof brandSelect }>

export const toAdminBrand = (b: BrandRow): AdminBrand => ({
  id: b.id,
  name: b.name,
  description: b.description,
  logoUrl: getPublicUrl(b.logoKey),
  watchCount: b._count.watches,
})

export async function getAdminBrands() {
  // checked here, not only in the layout: layouts don't re-run on client
  // navigation (Next docs, "Layouts and auth checks")
  await requireAdmin()
  const rows = await prisma.brand.findMany({ select: brandSelect, orderBy: { name: "asc" } })
  return rows.map(toAdminBrand)
}