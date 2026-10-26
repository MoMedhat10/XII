import "server-only"
import type { Prisma } from "@/app/generated/prisma/client"
import prisma from "../../../../lib/prisma"
import { getPublicUrl } from "../../../../lib/storage"
import { WATCHES_PAGE_SIZE, type WatchFilters } from "../_utils/watch-schema"
import type { AdminWatch, AdminWatchImage, AdminWatchPage } from "./types"

export const watchImageSelect = {
  id: true,
  key: true,
  alt: true,
} satisfies Prisma.WatchImageSelect

export const watchSelect = {
  id: true,
  name: true,
  model: true,
  description: true,
  priceCents: true,
  stock: true,
  isActive: true,
  brandId: true,
  createdAt: true,
  updatedAt: true,
  images: { select: watchImageSelect, orderBy: { sortOrder: "asc" } },
} satisfies Prisma.WatchSelect

type WatchImageRow = Prisma.WatchImageGetPayload<{
  select: typeof watchImageSelect
}>
type WatchRow = Prisma.WatchGetPayload<{ select: typeof watchSelect }>

export const toAdminWatchImage = (image: WatchImageRow): AdminWatchImage => ({
  id: image.id,
  url: getPublicUrl(image.key),
  alt: image.alt,
  progress: 100,
})

export const toAdminWatch = (w: WatchRow): AdminWatch => ({
  id: w.id,
  name: w.name,
  model: w.model,
  description: w.description,
  priceCents: w.priceCents,
  stock: w.stock,
  isActive: w.isActive,
  brandId: w.brandId,
  images: w.images.map(toAdminWatchImage),
  createdAt: w.createdAt.toISOString(),
  updatedAt: w.updatedAt.toISOString(),
})

function filtersWhere({
  q,
  brand,
  status,
}: WatchFilters): Prisma.WatchWhereInput {
  return {
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { model: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(brand && { brandId: brand }),
    ...(status !== "all" && { isActive: status === "live" }),
  }
}

export async function getAdminWatchPage(
  filters: WatchFilters
): Promise<AdminWatchPage> {
  const where = filtersWhere(filters)
  const pageSize = WATCHES_PAGE_SIZE

  return prisma.$transaction(async (tx) => {
    const [total, inventoryTotal] = await Promise.all([
      tx.watch.count({ where }),
      tx.watch.count(),
    ])
    const pageCount = Math.max(1, Math.ceil(total / pageSize))
    // e.g. ?page=99, or the last row of the last page was just deleted
    const page = Math.min(filters.page, pageCount)

    const rows = await tx.watch.findMany({
      where,
      select: watchSelect,
      // id breaks ties so rows never jump between pages
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return {
      watches: rows.map(toAdminWatch),
      total,
      inventoryTotal,
      page,
      pageCount,
      pageSize,
    }
  })
}

export async function getAdminWatchImages(watchId: string) {
  const rows = await prisma.watchImage.findMany({
    where: { watchId },
    select: watchImageSelect,
    orderBy: { sortOrder: "asc" },
  })
  return rows.map(toAdminWatchImage)
}
