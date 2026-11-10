// Sample order history for one existing account, until checkout exists.
//   npm run seed:orders -- you@example.com
// Re-running replaces that user's previous orders. Stock is left untouched,
// and lines have no image (a real checkout copies the cover to orders/).
import "dotenv/config"
import type { OrderStatus } from "@/app/generated/prisma/client"
import {
  DAY,
  SAMPLE_ADDRESS,
  buildOrderItems,
  createSeedClient,
  loadActiveWatches,
  orderTotal,
} from "./seed-lib"

const prisma = createSeedClient()

// status, days ago, [watch index, quantity][]
const PLAN: [OrderStatus, number, [number, number][]][] = [
  ["PAID", 1, [[0, 1]]],
  [
    "PAID",
    4,
    [
      [1, 1],
      [2, 1],
    ],
  ],
  ["SHIPPED", 9, [[3, 1]]],
  [
    "DELIVERED",
    32,
    [
      [4, 1],
      [0, 1],
      [5, 1],
    ],
  ],
  ["CANCELLED", 47, [[2, 1]]],
  ["DELIVERED", 120, [[5, 2]]],
]

async function main() {
  const email = process.argv[2]?.trim().toLowerCase()
  if (!email) throw new Error("Usage: npm run seed:orders -- <email>")

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  })
  if (!user) throw new Error(`No user with email ${email}`)

  const watches = await loadActiveWatches(prisma, 6)
  if (!watches.length) throw new Error("No active watches to order")
  const pick = (i: number) => watches[i % watches.length]

  await prisma.$transaction(async (tx) => {
    await tx.order.deleteMany({ where: { userId: user.id } })

    for (const [status, daysAgo, lines] of PLAN) {
      const items = buildOrderItems(lines.map(([i, qty]) => [pick(i), qty]))
      const placedAt = new Date(Date.now() - daysAgo * DAY)

      await tx.order.create({
        data: {
          userId: user.id,
          customerEmail: user.email,
          status,
          totalCents: orderTotal(items),
          createdAt: placedAt,
          ...SAMPLE_ADDRESS,
          orderItems: {
            create: items.map((i) => ({ ...i, createdAt: placedAt })),
          },
        },
      })
    }
  })

  console.log(`Seeded ${PLAN.length} orders for ${user.email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
