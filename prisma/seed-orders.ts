// Sample order history for one existing account, until checkout exists.
//   npm run seed:orders -- you@example.com
// Re-running replaces that user's previous orders. Stock is left untouched,
// and lines have no image (a real checkout copies the cover to orders/).
import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, type OrderStatus } from "@/app/generated/prisma/client"

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const DAY = 24 * 60 * 60 * 1000

const SAMPLE_ADDRESS = {
  shipName: "Sample Customer",
  shipPhone: "+41225550100", // E.164, as checkout stores it
  shipLine1: "12 Quai du Mont-Blanc",
  shipLine2: null,
  shipCity: "Geneva",
  shipRegion: null,
  shipPostalCode: "1201",
  shipCountry: "CH",
}

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

  const watches = await prisma.watch.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      model: true,
      priceCents: true,
      brand: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 6,
  })
  if (!watches.length) throw new Error("No active watches to order")
  const pick = (i: number) => watches[i % watches.length]

  await prisma.$transaction(async (tx) => {
    await tx.order.deleteMany({ where: { userId: user.id } })

    for (const [status, daysAgo, lines] of PLAN) {
      // the same watch twice in one order would be two lines; merge them
      const merged = new Map<string, number>()
      for (const [i, qty] of lines) {
        const id = pick(i).id
        merged.set(id, (merged.get(id) ?? 0) + qty)
      }
      const items = [...merged].map(([id, quantity]) => {
        const w = watches.find((x) => x.id === id)!
        return {
          watchId: w.id,
          quantity,
          unitPriceCents: w.priceCents,
          watchName: w.name,
          watchModel: w.model,
          brandName: w.brand.name,
          imageKey: null,
        }
      })
      const placedAt = new Date(Date.now() - daysAgo * DAY)

      await tx.order.create({
        data: {
          userId: user.id,
          customerEmail: user.email,
          status,
          totalCents: items.reduce(
            (n, i) => n + i.unitPriceCents * i.quantity,
            0
          ),
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
