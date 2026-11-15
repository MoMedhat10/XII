import "server-only"
import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { attachDatabasePool } from "@vercel/functions"
import { Pool } from "pg"

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

// The database allows 50 connections in total, and on Vercel every function
// instance gets its own pool. So: few connections per instance, idle ones
// closed quickly, and attachDatabasePool releases them before Vercel suspends
// an instance (a suspended instance can't run the idle timer; it's a no-op
// outside Vercel). In production DATABASE_URL points at the pooled host
// (pooled.db.prisma.io); migrations use the direct host from your local .env.
function createClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
  })
  attachDatabasePool(pool)
  // disposeExternalPool: $disconnect() also closes this pool
  const adapter = new PrismaPg(pool, { disposeExternalPool: true })
  return new PrismaClient({ adapter })
}

// In dev the client is cached on `global` so hot reloads don't open a new
// pool each time. Only reuse it if it was built from the *current* generated
// client: after `prisma generate`, hot reload brings in a new PrismaClient
// class, and an instance of the old one doesn't know the new schema (queries
// on new columns throw, and getCurrentUser() then looks signed out).
const cached = globalForPrisma.prisma
const prisma = cached instanceof PrismaClient ? cached : createClient()

// a client from before `prisma generate`: close its pool instead of leaking it
if (cached && cached !== prisma) void cached.$disconnect()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
