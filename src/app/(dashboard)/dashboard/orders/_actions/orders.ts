"use server"

import { after } from "next/server"

import { Prisma, type OrderStatus } from "@/app/generated/prisma/client"
import {
  sendOrderCancelled,
  sendOrderShipped,
} from "@/app/(app)/checkout/_utils/order-email"
import { orderRef } from "@/app/(app)/orders/_utils/order-format"
import { logger } from "../../../../../../lib/pino"
import prisma from "../../../../../../lib/prisma"
import { restockOrder } from "../../../../../../lib/order-stock"
import { generateTrackingNumber } from "../../../../../../lib/tracking-number"
import { requireAdmin } from "../../../_server/require-admin"
import { fail, parseFail, type ActionRes } from "../../../_utils/action-result"
import {
  orderIdSchema,
  shipOrderSchema,
  type OrderIdInput,
  type ShipOrderInput,
} from "../_utils/order-schema"

const GONE = "This order no longer exists."

// Every change is a compare-and-swap on status (`where: { status }`), so two
// admins, or an admin and the customer cancelling, can't both win. When the
// swap misses, this explains what happened instead.
const MOVED_ON: Record<OrderStatus, string> = {
  PAID: "This order hasn't shipped yet.",
  SHIPPED: "This order has already shipped.",
  DELIVERED: "This order was already delivered.",
  CANCELLED: "This order was already cancelled.",
}

async function missedSwap(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true },
  })
  return fail(order ? MOVED_ON[order.status] : GONE)
}

function actionFail(error: unknown, action: string) {
  logger.error({ error, action }, "order action failed")
  return fail("Something went wrong. Please try again.")
}

const audit = (adminId: string, orderId: string, action: string) =>
  logger.info({ adminId, orderId, action }, "admin order action")

/** A tracking number another order already has (`trackingNumber` is unique). */
const isDuplicateNumber = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002"

/** Generated numbers practically never collide; this many tries is plenty. */
const GENERATE_ATTEMPTS = 3

/**
 * PAID → SHIPPED. Without a tracking number from the admin, an XII shipment
 * number is generated. Emails the customer.
 */
export async function shipOrder(
  input: ShipOrderInput
): Promise<ActionRes<{ trackingNumber: string }>> {
  const admin = await requireAdmin()
  const parsed = shipOrderSchema.safeParse(input)
  if (!parsed.success) return parseFail(parsed.error)
  const { id, carrier } = parsed.data
  const generated = parsed.data.trackingNumber === undefined

  try {
    for (let attempt = 1; ; attempt++) {
      const trackingNumber =
        parsed.data.trackingNumber ?? generateTrackingNumber()
      try {
        const { count } = await prisma.order.updateMany({
          where: { id, status: "PAID" },
          data: {
            status: "SHIPPED",
            shippedAt: new Date(),
            carrier,
            trackingNumber,
          },
        })
        if (!count) return missedSwap(id)

        logger.info(
          { adminId: admin.id, orderId: id, action: "ship", generated },
          "admin order action"
        )
        after(() => sendOrderShipped(id))
        return {
          success: true,
          message: `${orderRef(id)} marked shipped`,
          data: { trackingNumber },
        }
      } catch (error) {
        if (!isDuplicateNumber(error)) throw error
        if (!generated) {
          return {
            success: false,
            message: "This number is already on another order.",
            fieldErrors: {
              trackingNumber: "This number is already on another order.",
            },
          }
        }
        if (attempt >= GENERATE_ATTEMPTS) throw error
      }
    }
  } catch (error) {
    return actionFail(error, "shipOrder")
  }
}

/** SHIPPED → DELIVERED. No email: the customer signed for it. */
export async function markDelivered(
  input: OrderIdInput
): Promise<ActionRes<null>> {
  const admin = await requireAdmin()
  const parsed = orderIdSchema.safeParse(input)
  if (!parsed.success) return fail(GONE)
  const { id } = parsed.data

  try {
    const { count } = await prisma.order.updateMany({
      where: { id, status: "SHIPPED" },
      data: { status: "DELIVERED", deliveredAt: new Date() },
    })
    if (!count) return missedSwap(id)

    audit(admin.id, id, "deliver")
    return {
      success: true,
      message: `${orderRef(id)} marked delivered`,
      data: null,
    }
  } catch (error) {
    return actionFail(error, "markDelivered")
  }
}

/**
 * PAID → CANCELLED (an order that shipped can't be cancelled). Puts the stock
 * back in the same transaction, then emails the customer.
 */
export async function cancelOrderAsAdmin(
  input: OrderIdInput
): Promise<ActionRes<{ restocked: number }>> {
  const admin = await requireAdmin()
  const parsed = orderIdSchema.safeParse(input)
  if (!parsed.success) return fail(GONE)
  const { id } = parsed.data

  try {
    const restocked = await prisma.$transaction(async (tx) => {
      const { count } = await tx.order.updateMany({
        where: { id, status: "PAID" },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      })
      return count ? restockOrder(tx, id) : null
    })
    if (restocked === null) return missedSwap(id)

    audit(admin.id, id, "cancel")
    after(() => sendOrderCancelled(id))
    return {
      success: true,
      message: `${orderRef(id)} cancelled`,
      data: { restocked },
    }
  } catch (error) {
    return actionFail(error, "cancelOrderAsAdmin")
  }
}
