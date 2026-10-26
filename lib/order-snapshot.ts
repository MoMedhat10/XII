import "server-only"
import type { Prisma } from "@/app/generated/prisma/client"
import { copyObject } from "./storage"

/**
 * What an order line stores about the watch, taken at checkout. Call it inside
 * the checkout transaction and spread the result into OrderItem.create.
 *
 * The cover image is *copied* to orders/, because the watch's own images can
 * be deleted later. If the transaction then fails, delete `imageKey` (it's an
 * orphan copy).
 */
export async function snapshotWatchForOrder(
  tx: Prisma.TransactionClient,
  watchId: string
) {
  const watch = await tx.watch.findUniqueOrThrow({
    where: { id: watchId },
    select: {
      name: true,
      model: true,
      brand: { select: { name: true } },
      images: { select: { key: true }, orderBy: { sortOrder: "asc" }, take: 1 },
    },
  })

  const cover = watch.images[0]?.key
  let imageKey: string | null = null
  if (cover) {
    const ext = cover.slice(cover.lastIndexOf("."))
    imageKey = `orders/${crypto.randomUUID()}${ext}`
    await copyObject(cover, imageKey)
  }

  return {
    watchName: watch.name,
    watchModel: watch.model,
    brandName: watch.brand.name,
    imageKey,
  }
}
