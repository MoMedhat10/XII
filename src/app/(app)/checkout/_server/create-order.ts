import "server-only"
import type { Prisma } from "@/app/generated/prisma/client"
import prisma from "../../../../../lib/prisma"
import { snapshotWatchForOrder } from "../../../../../lib/order-snapshot"
import { logger } from "../../../../../lib/pino"
import type { ShippingInput } from "../_utils/checkout-schema"

/** A failure whose message is safe to show the customer. */
export class CheckoutError extends Error {
  constructor(
    message: string,
    /** the bag or prices changed: the client should refresh its summary */
    readonly stale = false
  ) {
    super(message)
    this.name = "CheckoutError"
  }
}

/** A watch row changed between this attempt's read and its write. */
class VersionConflict extends Error {
  constructor(readonly watchId: string) {
    super(`Watch ${watchId} changed during checkout`)
    this.name = "VersionConflict"
  }
}

const MAX_ATTEMPTS = 3

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

type CreateOrderInput = {
  userId: string
  email: string
  checkoutKey: string
  expectedTotalCents: number
  shipping: ShippingInput
}

/**
 * Turns the user's bag into a PAID order using optimistic locking.
 *
 * No rows are locked. Each attempt reads the watches with their `version`,
 * checks stock and prices against that read, then takes stock with a
 * compare-and-swap on the version. If anything else wrote the row in
 * between (another checkout, an admin edit, a cancel), the swap matches no
 * row, the whole attempt rolls back and is retried on fresh data.
 *
 * `copiedKeys` collects the order images copied to storage, so the caller
 * can delete them if the order isn't created.
 */
export async function createOrderOptimistic(
  input: CreateOrderInput,
  copiedKeys: string[]
): Promise<string> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await prisma.$transaction(
        (tx) => attemptOrder(tx, input, copiedKeys),
        // snapshots copy images to storage inside the transaction
        { timeout: 20_000 }
      )
    } catch (error) {
      if (!(error instanceof VersionConflict)) throw error
      logger.info(
        { watchId: error.watchId, attempt },
        "Checkout version conflict"
      )
      if (attempt === MAX_ATTEMPTS) {
        throw new CheckoutError(
          "These pieces are in high demand right now. Please try again."
        )
      }
      // exponential backoff with jitter, so competing checkouts spread out
      await sleep(25 * 2 ** attempt + Math.random() * 25)
    }
  }
}

async function attemptOrder(
  tx: Prisma.TransactionClient,
  {
    userId,
    email,
    checkoutKey,
    expectedTotalCents,
    shipping,
  }: CreateOrderInput,
  copiedKeys: string[]
) {
  // 1. Read the bag with each watch's current version.
  const rows = await tx.cartItem.findMany({
    where: { cart: { userId } },
    select: {
      quantity: true,
      watch: {
        select: {
          id: true,
          name: true,
          isActive: true,
          stock: true,
          priceCents: true,
          version: true,
        },
      },
    },
    // a fixed order, so concurrent checkouts write rows in the same order
    orderBy: { watchId: "asc" },
  })

  // 2. Validate against that read. Unbuyable watches are hidden on the bag
  //    and checkout pages, so they're skipped here too, not ordered.
  const lines = rows.filter((r) => r.watch.isActive && r.watch.stock > 0)
  if (!lines.length) throw new CheckoutError("Your bag is empty.", true)

  const short = lines.find((l) => l.quantity > l.watch.stock)
  if (short) {
    throw new CheckoutError(
      `${short.watch.name} is no longer available in that quantity. Review your bag.`,
      true
    )
  }

  const totalCents = lines.reduce(
    (sum, l) => sum + l.watch.priceCents * l.quantity,
    0
  )
  if (totalCents !== expectedTotalCents) {
    throw new CheckoutError(
      "Your bag or its prices changed since you opened checkout. Review the new total.",
      true
    )
  }

  // 3. Compare-and-swap: take stock only if the row is still the version we
  //    validated. The version alone proves stock, price and isActive are
  //    unchanged, so no extra stock condition is needed.
  for (const { watch, quantity } of lines) {
    const { count } = await tx.watch.updateMany({
      where: { id: watch.id, version: watch.version },
      data: { stock: { decrement: quantity }, version: { increment: 1 } },
    })
    if (count === 0) throw new VersionConflict(watch.id)
  }

  // 4. Snapshot only after every swap succeeded, so a conflicting attempt
  //    never copies images.
  const items = []
  for (const { watch, quantity } of lines) {
    const snapshot = await snapshotWatchForOrder(tx, watch.id)
    if (snapshot.imageKey) copiedKeys.push(snapshot.imageKey)
    items.push({
      watchId: watch.id,
      quantity,
      unitPriceCents: watch.priceCents,
      ...snapshot,
    })
  }

  // 5. The order, with the shipping snapshot.
  const order = await tx.order.create({
    data: {
      userId,
      customerEmail: email,
      status: "PAID",
      totalCents,
      checkoutKey,
      shipName: shipping.name,
      shipPhone: shipping.phone,
      shipLine1: shipping.line1,
      shipLine2: shipping.line2 || null,
      shipCity: shipping.city,
      shipRegion: shipping.region || null,
      shipPostalCode: shipping.postalCode,
      shipCountry: shipping.country,
      orderItems: { create: items },
    },
    select: { id: true },
  })

  // 6. Empty the bag of what was ordered.
  await tx.cartItem.deleteMany({
    where: {
      cart: { userId },
      watchId: { in: lines.map((l) => l.watch.id) },
    },
  })

  return order.id
}
