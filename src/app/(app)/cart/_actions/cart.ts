"use server"

import { refresh } from "next/cache"
import { getCurrentUser } from "@/app/(auth)/_utils/session"

import prisma from "../../../../../lib/prisma"
import { logger } from "../../../../../lib/pino"
import { addToBagSchema, type AddToBagInput } from "../_utils/cart-schema"

type AddToBagRes =
  | { success: true; message: string; data: { added: number } }
  | { success: false; message: string }

/**
 * Puts one of each watch in the current user's bag. Watches that are
 * deactivated, sold out or already in the bag are skipped.
 */
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
