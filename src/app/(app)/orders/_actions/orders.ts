"use server"

import { refresh } from "next/cache"
import { getCurrentUser } from "@/app/(auth)/_utils/session"

import prisma from "../../../../../lib/prisma"
import { logger } from "../../../../../lib/pino"
import { restockOrder } from "../../../../../lib/order-stock"
import { orderRef } from "../_utils/order-format"
import {
  cancelOrderSchema,
  type CancelOrderInput,
} from "../_utils/orders-schema"

type CancelOrderRes = { success: boolean; message: string }

/** Cancels one of the user's orders while it's still PAID (not shipped). */
export async function cancelOrder(
  input: CancelOrderInput
): Promise<CancelOrderRes> {
  const parsed = cancelOrderSchema.safeParse(input)
  if (!parsed.success) return { success: false, message: "Invalid request." }
  const { orderId } = parsed.data

  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, message: "Sign in to manage orders." }

    const cancelled = await prisma.$transaction(async (tx) => {
      // The status condition makes this safe against the order being marked
      // shipped at the same moment: only one of the two updates can match.
      const { count } = await tx.order.updateMany({
        where: { id: orderId, userId: user.id, status: "PAID" },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      })
      if (!count) return false

      await restockOrder(tx, orderId)
      return true
    })

    if (!cancelled) {
      const order = await prisma.order.findFirst({
        where: { id: orderId, userId: user.id },
        select: { status: true },
      })
      if (!order) return { success: false, message: "Order not found." }
      if (order.status === "CANCELLED") {
        refresh()
        return { success: true, message: "This order is already cancelled" }
      }
      refresh()
      return {
        success: false,
        message: "This order has already shipped and can't be cancelled.",
      }
    }

    refresh()
    return { success: true, message: `Order ${orderRef(orderId)} cancelled` }
  } catch (error) {
    logger.error(error, "Error cancelling order")
    return { success: false, message: "Couldn't cancel your order." }
  }
}
