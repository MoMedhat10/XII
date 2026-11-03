import "server-only"
import type { Prisma } from "@/app/generated/prisma/client"
import prisma from "../../../../../lib/prisma"
import { getPublicUrl } from "../../../../../lib/storage"
import { CATALOG_PAGE_SIZE, type CatalogQuery } from "../_utils/catalog-schema"
import type { CatalogFacets, CatalogPage, CatalogWatch } from "./types"

const catalogWatchSelect = {
  id: true,
  name: true,
  model: true,
  priceCents: true,
  caliber: true,
  caseMaterial: true,
  brand: { select: { name: true } },
  // the card shows the cover only
  images: {
    select: { key: true, alt: true },
    orderBy: { sortOrder: "asc" },
    take: 1,
  },
} satisfies Prisma.WatchSelect

type CatalogWatchRow = Prisma.WatchGetPayload<{
  select: typeof catalogWatchSelect
}>

const toCatalogWatch = ({
  brand,
  images: [cover],
  ...w
}: CatalogWatchRow): CatalogWatch => ({
  ...w,
  brand: brand.name,
  image: cover ? { url: getPublicUrl(cover.key), alt: cover.alt } : null,
})

/** The newest live watches, for the home page's Curated Drop. */
export async function getFeaturedWatches(limit = 3): Promise<CatalogWatch[]> {
  const rows = await prisma.watch.findMany({
    where: { isActive: true },
    select: catalogWatchSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
  })
  return rows.map(toCatalogWatch)
}

// id breaks ties so rows never jump between pages
const ORDER_BY: Record<
  CatalogQuery["sort"],
  Prisma.WatchOrderByWithRelationInput[]
> = {
  new: [{ createdAt: "desc" }, { id: "desc" }],
  asc: [{ priceCents: "asc" }, { id: "asc" }],
  desc: [{ priceCents: "desc" }, { id: "desc" }],
  az: [{ name: "asc" }, { id: "asc" }],
}

function catalogWhere({
  q,
  brand,
  min,
  max,
}: CatalogQuery): Prisma.WatchWhereInput {
  // Prisma passes `contains` straight into ILIKE without escaping, so "%"
  // or "_" would match every watch. Backslash is ILIKE's escape character.
  const term = q.replace(/[\\%_]/g, "\\$&")
  return {
    isActive: true,
    ...(term && {
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { model: { contains: term, mode: "insensitive" } },
        { brand: { name: { contains: term, mode: "insensitive" } } },
      ],
    }),
    ...(brand.length && { brandId: { in: brand } }),
    ...((min !== undefined || max !== undefined) && {
      priceCents: {
        ...(min !== undefined && { gte: min * 100 }),
        ...(max !== undefined && { lte: max * 100 }),
      },
    }),
  }
}

export async function getCatalogPage(
  query: CatalogQuery
): Promise<CatalogPage> {
  const where = catalogWhere(query)
  const [total, rows] = await Promise.all([
    prisma.watch.count({ where }),
    prisma.watch.findMany({
      where,
      select: catalogWatchSelect,
      orderBy: ORDER_BY[query.sort],
      skip: query.offset,
      take: CATALOG_PAGE_SIZE,
    }),
  ])
  const end = query.offset + rows.length
  return {
    watches: rows.map(toCatalogWatch),
    total,
    nextOffset: rows.length && end < total ? end : null,
  }
}

export async function getCatalogFacets(): Promise<CatalogFacets> {
  const [brands, price] = await Promise.all([
    prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { watches: { where: { isActive: true } } } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.watch.aggregate({
      where: { isActive: true },
      _max: { priceCents: true },
    }),
  ])
  return {
    brands: brands
      .filter((b) => b._count.watches > 0)
      .map((b) => ({ id: b.id, name: b.name, count: b._count.watches })),
    maxPriceCents: price._max.priceCents ?? 0,
  }
}

export async function getFavoriteWatchIds(userId: string) {
  const rows = await prisma.favoriteWatch.findMany({
    where: { userId },
    select: { watchId: true },
  })
  return rows.map((r) => r.watchId)
}
