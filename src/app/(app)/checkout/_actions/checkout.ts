"use server"

import { after } from "next/server"
import { Prisma } from "@/app/generated/prisma/client"
import { getCurrentUser } from "@/app/(auth)/_utils/session"
import {
  rateLimitOrThrow,
  ServiceUnavailableError,
} from "@/app/(auth)/_utils/rateLimit"

import prisma from "../../../../../lib/prisma"
import { logger } from "../../../../../lib/pino"
import { deleteObjects } from "../../../../../lib/storage"
import { CheckoutError, createOrderOptimistic } from "../_server/create-order"
import { DECLINE_CARD } from "../_utils/card"
import {
  placeOrderSchema,
  type PlaceOrderInput,
} from "../_utils/checkout-schema"
import { sendOrderConfirmation } from "../_utils/order-email"

type PlaceOrderRes =
  | { success: true; message: string; data: { orderId: string } }
  | {
      success: false
      message: string
      stale?: boolean
    }

const placed = (orderId: string): PlaceOrderRes => ({
  success: true,
  message: "Order placed",
  data: { orderId },
})

const existingOrder = (userId: string, checkoutKey: string) =>
  prisma.order.findFirst({
    where: { userId, checkoutKey },
    select: { id: true },
  })

/**
 * Pays (simulated) and turns the bag into an order. The input holds card
 * details, so it is never logged.
 */
export async function placeOrder(
  input: PlaceOrderInput
): Promise<PlaceOrderRes> {
  const parsed = placeOrderSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: "Check the highlighted fields." }
  }
  const { shipping, payment, checkoutKey, expectedTotalCents } = parsed.data

  const user = await getCurrentUser().catch(() => null)
  if (!user) return { success: false, message: "Sign in to check out." }

  const copiedKeys: string[] = []
  try {
    // Fails closed: no orders while the limiter is down.
    const limit = await rateLimitOrThrow({
      key: `checkout:user:${user.id}`,
      limit: 10,
      windowSeconds: 10 * 60,
    })
    if (!limit.allowed) {
      return {
        success: false,
        message: "Too many attempts. Please wait a few minutes.",
      }
    }

    // A retry after a lost response lands on the order already placed.
    const existing = await existingOrder(user.id, checkoutKey)
    if (existing) return placed(existing.id)

    // Simulated payment, before anything is written.
    if (payment.cardNumber === DECLINE_CARD) {
      return {
        success: false,
        message: "Your card was declined. Try another card.",
      }
    }

    const orderId = await createOrderOptimistic(
      {
        userId: user.id,
        email: user.email,
        checkoutKey,
        expectedTotalCents,
        shipping,
      },
      copiedKeys
    )

    after(() => sendOrderConfirmation(orderId))
    return placed(orderId)
    
  } catch (error) {
    // The order wasn't created, so its image copies are orphans.
    if (copiedKeys.length) {
      await deleteObjects(copiedKeys).catch((e) =>
        logger.error(e, "Error deleting orphan order images")
      )
    }

    // Two submits with the same key at once: the other one won.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const order = await existingOrder(user.id, checkoutKey)
      if (order) return placed(order.id)
    }
    if (error instanceof CheckoutError) {
      return { success: false, message: error.message, stale: error.stale }
    }
    if (error instanceof ServiceUnavailableError) {
      return { success: false, message: error.message }
    }
    logger.error(error, "Error placing order")
    return {
      success: false,
      message: "Couldn't place your order. You haven't been charged.",
    }
  }
}
