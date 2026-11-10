// Realistic CUSTOMER accounts for trying the admin Users page.
//   npm run seed:users                  24 users (replaces the previous seed)
//   npm run seed:users -- --count=60    1–200 users
//   npm run seed:users -- --clear       remove the seeded users and their orders
//
// Every seeded row is scoped to the @seed.xii.test email domain (.test is a
// reserved TLD: mail to it can never be delivered), so re-runs and --clear
// never touch real accounts. Seeded users can't sign in: their password hash
// is a real bcrypt hash of a random password that's thrown away. Never
// creates admins.
import "dotenv/config"
import { randomBytes } from "node:crypto"
import bcrypt from "bcryptjs"
import type { OrderStatus, Prisma } from "@/app/generated/prisma/client"
import {
  DAY,
  SAMPLE_ADDRESS,
  buildOrderItems,
  createSeedClient,
  loadActiveWatches,
  makeRandom,
  orderTotal,
  type SeedWatch,
} from "./seed-lib"

const DOMAIN = "@seed.xii.test"
const SEED = 20261110
const DEFAULT_COUNT = 24
const SESSION_DAYS = 7

const FIRST = [
  "elena",
  "kenji",
  "amara",
  "lucas",
  "sofia",
  "omar",
  "ingrid",
  "mateo",
  "yuki",
  "nadia",
  "henrik",
  "priya",
  "julien",
  "leila",
  "tomas",
  "aiko",
  "felix",
  "zara",
  "dmitri",
  "chiara",
  "kwame",
  "ines",
  "rafael",
  "mei",
]
const LAST = [
  "marchetti",
  "watanabe",
  "okafor",
  "dubois",
  "lindqvist",
  "haddad",
  "costa",
  "nakamura",
  "moreau",
  "fischer",
  "rossi",
  "sato",
  "almeida",
  "novak",
  "hansen",
  "khan",
  "laurent",
  "silva",
  "berg",
  "ferrari",
]

const prisma = createSeedClient()

function parseArgs() {
  const args = process.argv.slice(2)
  const countArg = args.find((a) => a.startsWith("--count="))
  const count = countArg ? Number(countArg.split("=")[1]) : DEFAULT_COUNT
  if (!Number.isInteger(count) || count < 1 || count > 200) {
    throw new Error("--count must be a whole number from 1 to 200")
  }
  return { clear: args.includes("--clear"), count }
}

/** Removes the previous seed. Orders go first: deleting a user keeps them (SetNull). */
async function clearSeed(tx: Prisma.TransactionClient) {
  const orders = await tx.order.deleteMany({
    where: { customerEmail: { endsWith: DOMAIN } },
  })
  const users = await tx.user.deleteMany({
    where: { email: { endsWith: DOMAIN } },
  })
  return { users: users.count, orders: orders.count }
}

type Random = ReturnType<typeof makeRandom>

/** Status that fits the order's age: recent ones are still moving. */
function statusFor(rnd: Random, ageDays: number): OrderStatus {
  if (rnd.chance(0.12)) return "CANCELLED"
  if (ageDays < 3) return "PAID"
  if (ageDays < 10) return rnd.pick(["PAID", "SHIPPED", "SHIPPED"] as const)
  return rnd.chance(0.85) ? "DELIVERED" : "SHIPPED"
}

function buildUser(
  rnd: Random,
  {
    index,
    username,
    passwordHash,
    suspended,
    watches,
    now,
  }: {
    index: number
    username: string
    passwordHash: string
    suspended: boolean
    watches: SeedWatch[]
    now: number
  }
): Prisma.UserCreateInput {
  const email = `${username}${DOMAIN}`
  // about 5 joined in the last 30 days, the rest over the past 6 months
  const daysAgo = index < 5 ? rnd.int(1, 29) : rnd.int(31, 180)
  const createdAt = new Date(now - daysAgo * DAY - rnd.int(0, DAY - 1))
  // suspended accounts were verified first (you can't misuse an account you
  // never activated)
  const verified = suspended || rnd.chance(0.85)
  const verifiedAt = verified
    ? new Date(createdAt.getTime() + rnd.int(5 * 60_000, 2 * DAY))
    : null
  const suspendedAt =
    suspended && verifiedAt
      ? new Date(
          verifiedAt.getTime() + rnd.next() * (now - verifiedAt.getTime())
        )
      : null

  // orders: about 60% of verified users have bought something
  const orders: Prisma.OrderCreateWithoutUserInput[] = []
  if (verifiedAt && rnd.chance(0.6)) {
    for (let n = rnd.int(1, 6); n > 0; n--) {
      const placed = new Date(
        verifiedAt.getTime() + rnd.next() * (now - verifiedAt.getTime())
      )
      const lines = rnd
        .sample(watches, rnd.int(1, 3))
        .map((w): [SeedWatch, number] => [w, rnd.chance(0.15) ? 2 : 1])
      const items = buildOrderItems(lines)
      orders.push({
        customerEmail: email,
        status: statusFor(rnd, (now - placed.getTime()) / DAY),
        totalCents: orderTotal(items),
        createdAt: placed,
        ...SAMPLE_ADDRESS,
        shipName: username.replace("_", " "),
        orderItems: {
          create: items.map((i) => ({ ...i, createdAt: placed })),
        },
      })
    }
  }

  const favorites = rnd.sample(watches, rnd.int(0, 6)).map((w) => ({
    watchId: w.id,
    createdAt: new Date(
      createdAt.getTime() + rnd.next() * (now - createdAt.getTime())
    ),
  }))

  const cartLines = rnd.chance(0.4)
    ? rnd
        .sample(watches, rnd.int(1, 3))
        .map((w) => ({ watchId: w.id, quantity: rnd.int(1, 2) }))
    : []

  // fake sessions, so "N active" and Sign out everywhere have something to
  // show. Nobody holds these cookies.
  const sessions =
    verifiedAt && !suspended && rnd.chance(0.5)
      ? Array.from({ length: rnd.int(1, 2) }, () => {
          const started = now - rnd.int(0, 5 * DAY)
          return {
            id: randomBytes(32).toString("hex"),
            createdAt: new Date(started),
            expiresAt: new Date(started + SESSION_DAYS * DAY),
          }
        })
      : []

  return {
    username,
    email,
    passwordHash,
    role: "CUSTOMER",
    createdAt,
    emailVerifiedAt: verifiedAt,
    suspendedAt,
    ...(orders.length && { orders: { create: orders } }),
    ...(favorites.length && { favorites: { create: favorites } }),
    ...(cartLines.length && {
      cart: { create: { cartItems: { create: cartLines } } },
    }),
    ...(sessions.length && { session: { create: sessions } }),
  }
}

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("seed:users refuses to run with NODE_ENV=production")
  }
  const { clear, count } = parseArgs()

  if (clear) {
    const removed = await prisma.$transaction(clearSeed)
    console.log(
      `Removed ${removed.users} seeded users and ${removed.orders} of their orders.`
    )
    return
  }

  const watches = await loadActiveWatches(prisma)
  if (!watches.length) {
    throw new Error(
      "No live watches: add and publish a few on /dashboard/watches first (orders, carts and wishlists use them)."
    )
  }

  // usernames are unique across ALL accounts, so steer clear of real ones
  const taken = new Set(
    (
      await prisma.user.findMany({
        where: { NOT: { email: { endsWith: DOMAIN } } },
        select: { username: true },
      })
    ).map((u) => u.username.toLowerCase())
  )

  const rnd = makeRandom(SEED)
  const usernames: string[] = []
  while (usernames.length < count) {
    const base = `${rnd.pick(FIRST)}_${rnd.pick(LAST)}`.slice(0, 21)
    let name = base
    for (let n = 2; taken.has(name); n++) name = `${base}${n}`
    taken.add(name)
    usernames.push(name)
  }

  // one hash for everyone: a password that's generated and immediately lost
  const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10)
  const now = Date.now()
  const suspendedIdx = new Set(
    rnd.sample(
      Array.from({ length: count }, (_, i) => i).filter((i) => i >= 5),
      Math.min(2, Math.max(0, count - 5))
    )
  )
  const users = usernames.map((username, index) =>
    buildUser(rnd, {
      index,
      username,
      passwordHash,
      suspended: suspendedIdx.has(index),
      watches,
      now,
    })
  )

  const removed = await prisma.$transaction(
    async (tx) => {
      const removed = await clearSeed(tx)
      for (const data of users) await tx.user.create({ data })
      return removed
    },
    // a remote dev database can be slow for a couple of hundred inserts
    { maxWait: 10_000, timeout: 120_000 }
  )

  const created = await prisma.user.findMany({
    where: { email: { endsWith: DOMAIN } },
    select: {
      emailVerifiedAt: true,
      suspendedAt: true,
      cart: { select: { id: true } },
      _count: { select: { orders: true, favorites: true, session: true } },
    },
  })
  const sum = (f: (u: (typeof created)[number]) => number) =>
    created.reduce((n, u) => n + f(u), 0)

  if (removed.users) {
    console.log(`Replaced the previous seed (${removed.users} users).`)
  }
  console.log(
    [
      `Seeded ${created.length} customers (${DOMAIN}):`,
      `  verified   ${sum((u) => (u.emailVerifiedAt ? 1 : 0))}`,
      `  unverified ${sum((u) => (u.emailVerifiedAt ? 0 : 1))}`,
      `  suspended  ${sum((u) => (u.suspendedAt ? 1 : 0))}`,
      `  orders     ${sum((u) => u._count.orders)}`,
      `  wishlist   ${sum((u) => u._count.favorites)} saved watches`,
      `  carts      ${sum((u) => (u.cart ? 1 : 0))}`,
      `  sessions   ${sum((u) => u._count.session)}`,
      "Seeded accounts can't sign in. Remove them with: npm run seed:users -- --clear",
    ].join("\n")
  )
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
