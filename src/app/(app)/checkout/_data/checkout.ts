import "server-only"
import prisma from "../../../../../lib/prisma"
import { buyableWatch, lineSelect, toCartLine } from "../../cart/_data/cart"
import type { CartLine } from "../../cart/_data/types"
import { sumSubtotal } from "../../cart/_utils/cart-lines"

export type CheckoutPage = {
  lines: CartLine[]
  subtotalCents: number
  email: string
}

/**
 * The bag as checkout sees it, or null when it can't be checked out as is:
 * empty, or a line holds more than is in stock (the bag page explains).
 */
export async function getCheckoutPage(
  userId: string,
  email: string
): Promise<CheckoutPage | null> {
  const rows = await prisma.cartItem.findMany({
    where: { cart: { userId }, watch: buyableWatch },
    select: lineSelect,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  })
  if (!rows.length) return null

  const lines = rows.map(toCartLine)
  // toCartLine clamps to stock; checkout must not silently buy fewer
  if (lines.some((l, i) => l.quantity < rows[i].quantity)) return null

  return { lines, subtotalCents: sumSubtotal(lines), email }
}
