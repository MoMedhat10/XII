import "server-only"
import type { Prisma } from "@/app/generated/prisma/client"
import prisma from "../../../../../lib/prisma"
import { getPublicUrl } from "../../../../../lib/storage"
import { savedLabel } from "../_utils/saved-label"
import {
  WISHLIST_MAX_SHOW,
  WISHLIST_PAGE_SIZE,
} from "../_utils/wishlist-schema"
import type { WishlistItem, WishlistPage } from "./types"

const wishlistSelect = (userId: string) =>
  ({
    createdAt: true,
    watch: {
      select: {
        id: true,
        name: true,
        model: true,
        priceCents: true,
        stock: true,
        brand: { select: { name: true } },
        images: {
          select: { key: true, alt: true },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
        // at most one row: is this watch in the user's bag?
        cartItems: {
          where: { cart: { userId } },
          select: { id: true },
          take: 1,
        },
      },
    },
  }) satisfies Prisma.FavoriteWatchSelect

type WishlistRow = Prisma.FavoriteWatchGetPayload<{
  select: ReturnType<typeof wishlistSelect>
}>

const toWishlistItem = ({ createdAt, watch }: WishlistRow): WishlistItem => {
  const cover = watch.images[0]
  return {
    id: watch.id,
    name: watch.name,
    model: watch.model,
    brand: watch.brand.name,
    priceCents: watch.priceCents,
    stock: watch.stock,
    image: cover ? { url: getPublicUrl(cover.key), alt: cover.alt } : null,
    savedLabel: savedLabel(createdAt),
    inBag: watch.cartItems.length > 0,
  }
}

/** The newest `show` saved watches, skipping deactivated ones. */
export async function getWishlistPage(
  userId: string,
  show: number
): Promise<WishlistPage> {
  const [rows, stats] = await Promise.all([
    prisma.favoriteWatch.findMany({
      where: { userId, watch: { isActive: true } },
      select: wishlistSelect(userId),
      // id breaks ties between saves in the same millisecond
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      // one extra row tells us whether there's more
      take: show + 1,
    }),
    prisma.watch.aggregate({
      where: { isActive: true, favorites: { some: { userId } } },
      _count: { _all: true },
      _sum: { priceCents: true },
    }),
  ])

  // `show` is capped, so past the cap there is no next step to link to
  const hasMore = rows.length > show && show < WISHLIST_MAX_SHOW
  return {
    items: rows.slice(0, show).map(toWishlistItem),
    count: stats._count._all,
    totalValueCents: stats._sum.priceCents ?? 0,
    nextShow: hasMore ? show + WISHLIST_PAGE_SIZE : null,
  }
}
