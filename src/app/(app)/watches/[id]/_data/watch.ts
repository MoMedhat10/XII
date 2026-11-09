import "server-only"
import { cache } from "react"
import { z } from "zod"

import type { Prisma } from "@/app/generated/prisma/client"
import prisma from "../../../../../../lib/prisma"
import { getPublicUrl } from "../../../../../../lib/storage"
import type { WatchDetail } from "./types"

export const detailSelect = {
  id: true,
  name: true,
  description: true,
  model: true,
  priceCents: true,
  stock: true,
  gender: true,
  movement: true,
  caliber: true,
  caseMaterial: true,
  condition: true,
  brand: { select: { name: true } },
  images: { select: { key: true, alt: true }, orderBy: { sortOrder: "asc" } },
} satisfies Prisma.WatchSelect

type WatchDetailRow = Prisma.WatchGetPayload<{ select: typeof detailSelect }>

export const toWatchDetail = ({
  brand,
  images,
  ...w
}: WatchDetailRow): WatchDetail => ({
  ...w,
  brand: brand.name,
  images: images.map((i) => ({ url: getPublicUrl(i.key), alt: i.alt })),
})

/**
 * A live watch by id, or null when it doesn't exist or is hidden.
 * Cached per request so generateMetadata and the page share one query.
 */
export const getWatchDetail = cache(
  async (id: string): Promise<WatchDetail | null> => {
    if (!z.uuid().safeParse(id).success) return null
    const row = await prisma.watch.findFirst({
      where: { id, isActive: true },
      select: detailSelect,
    })
    return row && toWatchDetail(row)
  }
)

/** Whether this user has saved the watch and whether it's in their bag. */
export async function getWatchViewer(watchId: string, userId: string) {
  const [favorite, cartItem] = await Promise.all([
    prisma.favoriteWatch.findUnique({
      where: { userId_watchId: { userId, watchId } },
      select: { id: true },
    }),
    prisma.cartItem.findFirst({
      where: { watchId, cart: { userId } },
      select: { id: true },
    }),
  ])
  return { saved: Boolean(favorite), inBag: Boolean(cartItem) }
}
