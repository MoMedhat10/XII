"use server"

import { refresh } from "next/cache"
import { getCurrentUser } from "@/app/(auth)/_utils/session"

import prisma from "../../../../../lib/prisma"
import { logger } from "../../../../../lib/pino"
import {
  addToBagSchema,
  CART_MAX_PER_PIECE,
  cartWatchSchema,
  setQuantitySchema,
  type AddToBagInput,
  type CartWatchInput,
  type SetQuantityInput,
} from "../_utils/cart-schema"

type AddToBagRes =
  | { success: true; message: string; data: { added: number } }
  | { success: false; message: string }

type CartRes =
  { success: true; message: string } | { success: false; message: string }

type SetQuantityRes =
  | { success: true; message: string; data: { quantity: number; max: number } }
  | { success: false; message: string }


export async function addToBag(input: AddToBagInput): Promise<AddToBagRes> {
  const parsed = addToBagSchema.safeParse(input)
  if (!parsed.success) return { success: false, message: "Invalid request." }
  const { watchIds } = parsed.data

  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, message: "Sign in to use your bag." }

    const addable = await prisma.watch.findMany({
      where: { id: { in: watchIds }, isActive: true, stock: { gt: 0 } },
      select: { id: true },
    })
    if (!addable.length) {
      return {
        success: false,
        message: "Nothing to add — those pieces are no longer available.",
      }
    }

    const { count } = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
        select: { id: true },
      })
      return tx.cartItem.createMany({
        data: addable.map((w) => ({
          cartId: cart.id,
          watchId: w.id,
          quantity: 1,
        })),
        skipDuplicates: true,
      })
    })

    refresh()
    if (!count) {
      return {
        success: true,
        message: "Already in your bag",
        data: { added: 0 },
      }
    }
    return {
      success: true,
      message:
        count === 1 ? "Added to your bag" : `Added ${count} pieces to your bag`,
      data: { added: count },
    }
  } catch (error) {
    logger.error(error, "Error adding to bag")
    return { success: false, message: "Couldn't update your bag." }
  }
}


export async function setCartQuantity(
  input: SetQuantityInput
): Promise<SetQuantityRes> {
  const parsed = setQuantitySchema.safeParse(input)
  if (!parsed.success) return { success: false, message: "Invalid request." }
  const { watchId, quantity: wanted } = parsed.data

  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, message: "Sign in to use your bag." }

    const watch = await prisma.watch.findFirst({
      where: { id: watchId, isActive: true, stock: { gt: 0 } },
      select: { stock: true },
    })
    if (!watch) {
      return { success: false, message: "This piece is no longer available." }
    }

    const max = Math.min(watch.stock, CART_MAX_PER_PIECE)
    const quantity = Math.min(wanted, max)
    const { count } = await prisma.cartItem.updateMany({
      where: { watchId, cart: { userId: user.id } },
      data: { quantity },
    })
    if (!count) {
      return { success: false, message: "This piece isn't in your bag." }
    }

    return {
      success: true,
      message: quantity < wanted ? `Only ${quantity} available` : "",
      data: { quantity, max },
    }
  } catch (error) {
    logger.error(error, "Error updating cart quantity")
    return { success: false, message: "Couldn't update your bag." }
  }
}

export async function removeFromCart(input: CartWatchInput): Promise<CartRes> {
  const parsed = cartWatchSchema.safeParse(input)
  if (!parsed.success) return { success: false, message: "Invalid request." }
  const { watchId } = parsed.data

  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, message: "Sign in to use your bag." }

    // idempotent: already removed in another tab is fine
    await prisma.cartItem.deleteMany({
      where: { watchId, cart: { userId: user.id } },
    })

    refresh()
    return { success: true, message: "Removed from your bag" }
  } catch (error) {
    logger.error(error, "Error removing from cart")
    return { success: false, message: "Couldn't update your bag." }
  }
}

/** Moves a watch from the bag to the wishlist in one transaction. */
export async function saveForLater(input: CartWatchInput): Promise<CartRes> {
  const parsed = cartWatchSchema.safeParse(input)
  if (!parsed.success) return { success: false, message: "Invalid request." }
  const { watchId } = parsed.data

  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, message: "Sign in to use your bag." }

    await prisma.$transaction([
      prisma.favoriteWatch.upsert({
        where: { userId_watchId: { userId: user.id, watchId } },
        create: { userId: user.id, watchId },
        update: {},
      }),
      prisma.cartItem.deleteMany({
        where: { watchId, cart: { userId: user.id } },
      }),
    ])

    refresh()
    return { success: true, message: "Moved to your wishlist" }
  } catch (error) {
    logger.error(error, "Error saving cart item for later")
    return { success: false, message: "Couldn't update your bag." }
  }
}
