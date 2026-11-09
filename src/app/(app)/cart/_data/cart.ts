import "server-only"
import type { MovementType, Prisma } from "@/app/generated/prisma/client"
import prisma from "../../../../../lib/prisma"
import { getPublicUrl } from "../../../../../lib/storage"
import { CART_MAX_PER_PIECE } from "../_utils/cart-schema"
import type { CartImage, CartLine, CartPage, CartPick } from "./types"

const coverSelect = {
  select: { key: true, alt: true },
  orderBy: { sortOrder: "asc" },
  take: 1,
} satisfies Prisma.Watch$imagesArgs

// Only watches a customer can still buy reach the page.
export const buyableWatch = {
  isActive: true,
  stock: { gt: 0 },
} satisfies Prisma.WatchWhereInput

export const lineSelect = {
  quantity: true,
  watch: {
    select: {
      id: true,
      name: true,
      model: true,
      priceCents: true,
      stock: true,
      movement: true,
      caseMaterial: true,
      brand: { select: { name: true } },
      images: coverSelect,
    },
  },
} satisfies Prisma.CartItemSelect

type LineRow = Prisma.CartItemGetPayload<{ select: typeof lineSelect }>

const toImage = (images: { key: string; alt: string }[]): CartImage => {
  const cover = images[0]
  return cover ? { url: getPublicUrl(cover.key), alt: cover.alt } : null
}

// AUTOMATIC -> Automatic
const movementLabel = (m: MovementType | null) =>
  m ? m[0] + m.slice(1).toLowerCase() : null

export function toCartLine({ quantity: stored, watch }: LineRow): CartLine {
  const max = Math.min(watch.stock, CART_MAX_PER_PIECE)
  // Stock can drop below what's in the bag; show what can actually be bought.
  const quantity = Math.min(stored, max)
  const flag =
    quantity < stored
      ? `Only ${max} available`
      : watch.stock <= 3
        ? `Only ${watch.stock} left`
        : null

  return {
    id: watch.id,
    name: watch.name,
    model: watch.model,
    spec: [watch.brand.name, movementLabel(watch.movement), watch.caseMaterial]
      .filter(Boolean)
      .join(" · "),
    priceCents: watch.priceCents,
    quantity,
    max,
    flag,
    image: toImage(watch.images),
  }
}

async function getPicks(userId: string): Promise<CartPick[]> {
  const rows = await prisma.favoriteWatch.findMany({
    where: {
      userId,
      watch: { ...buyableWatch, cartItems: { none: { cart: { userId } } } },
    },
    select: {
      watch: {
        select: { id: true, name: true, priceCents: true, images: coverSelect },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 3,
  })
  return rows.map(({ watch }) => ({
    id: watch.id,
    name: watch.name,
    priceCents: watch.priceCents,
    image: toImage(watch.images),
  }))
}

/** The user's bag, newest first, plus wishlist picks when it's empty. */
export async function getCartPage(userId: string): Promise<CartPage> {
  const rows = await prisma.cartItem.findMany({
    where: { cart: { userId }, watch: buyableWatch },
    select: lineSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  })
  const lines = rows.map(toCartLine)
  return { lines, picks: lines.length ? [] : await getPicks(userId) }
}
