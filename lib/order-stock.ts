import "server-only"
import type { Prisma } from "@/app/generated/prisma/client"

/**
 * Checkout takes stock when an order is placed, so cancelling gives it back.
 * Call it inside the same transaction that sets the order to CANCELLED.
 */
export async function restockOrder(
  tx: Prisma.TransactionClient,
  orderId: string
) {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: { watchId: true, quantity: true },
  })
  for (const { watchId, quantity } of items) {
    await tx.watch.update({
      where: { id: watchId },
      data: { stock: { increment: quantity }, version: { increment: 1 } },
    })
  }
  return items.reduce((n, i) => n + i.quantity, 0)
}
