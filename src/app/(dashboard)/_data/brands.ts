import "server-only"
import type { Prisma } from "@/app/generated/prisma/client"
import prisma from "../../../../lib/prisma"
import { getPublicUrl } from "../../../../lib/storage"
import type { AdminBrand } from "./mock-watches" 

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
  const rows = await prisma.brand.findMany({ select: brandSelect, orderBy: { name: "asc" } })
  return rows.map(toAdminBrand)
}