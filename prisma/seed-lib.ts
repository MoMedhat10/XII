// Shared by the dev seed scripts (seed-orders.ts, seed-users.ts).
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient, type OrderStatus } from "@/app/generated/prisma/client"
import { generateTrackingNumber } from "../lib/tracking-number"

export const DAY = 24 * 60 * 60 * 1000

export const createSeedClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

export const SAMPLE_ADDRESS = {
  shipName: "Sample Customer",
  shipPhone: "+41225550100", // E.164, as checkout stores it
  shipLine1: "12 Quai du Mont-Blanc",
  shipLine2: null,
  shipCity: "Geneva",
  shipRegion: null,
  shipPostalCode: "1201",
  shipCountry: "CH",
}

export type SeedWatch = {
  id: string
  name: string
  model: string
  priceCents: number
  brand: { name: string }
}

/** Live watches, oldest first (orders, carts and wishlists only use these). */
export const loadActiveWatches = (prisma: PrismaClient, take?: number) =>
  prisma.watch.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      model: true,
      priceCents: true,
      brand: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
    take,
  })

/**
 * Order lines with the snapshot fields checkout writes. The same watch twice
 * becomes one line with the quantities added up. No image: a real checkout
 * copies the cover to orders/, which a seed can't do.
 */
export function buildOrderItems(lines: [SeedWatch, number][]) {
  const merged = new Map<string, { watch: SeedWatch; quantity: number }>()
  for (const [watch, quantity] of lines) {
    const line = merged.get(watch.id)
    if (line) line.quantity += quantity
    else merged.set(watch.id, { watch, quantity })
  }
  return [...merged.values()].map(({ watch, quantity }) => ({
    watchId: watch.id,
    quantity,
    unitPriceCents: watch.priceCents,
    watchName: watch.name,
    watchModel: watch.model,
    brandName: watch.brand.name,
    imageKey: null,
  }))
}

/**
 * The fulfilment fields an order in `status` would have by now: shipped 2
 * days after it was placed, delivered 4 days later, or cancelled within a few
 * hours. Times never land in the future.
 */
export function fulfilmentFor(status: OrderStatus, placedAt: Date) {
  const at = (ms: number) =>
    new Date(Math.min(placedAt.getTime() + ms, Date.now()))
  const shipped = status === "SHIPPED" || status === "DELIVERED"
  return {
    carrier: shipped ? "DHL Express" : null,
    trackingNumber: shipped ? generateTrackingNumber() : null,
    shippedAt: shipped ? at(2 * DAY) : null,
    deliveredAt: status === "DELIVERED" ? at(6 * DAY) : null,
    cancelledAt: status === "CANCELLED" ? at(DAY / 4) : null,
  }
}

export const orderTotal = (
  items: { unitPriceCents: number; quantity: number }[]
) => items.reduce((n, i) => n + i.unitPriceCents * i.quantity, 0)

/** Small seeded PRNG (mulberry32): the same seed gives the same data every run. */
export function makeRandom(seed: number) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  /** integer in [min, max] */
  const int = (min: number, max: number) =>
    min + Math.floor(next() * (max - min + 1))
  const pick = <T>(items: readonly T[]) => items[int(0, items.length - 1)]
  const chance = (p: number) => next() < p
  /** up to `n` distinct items */
  const sample = <T>(items: readonly T[], n: number) => {
    const pool = [...items]
    const out: T[] = []
    while (out.length < n && pool.length) {
      out.push(pool.splice(int(0, pool.length - 1), 1)[0])
    }
    return out
  }
  return { next, int, pick, chance, sample }
}
