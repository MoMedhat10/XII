import "server-only"
import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

// In dev the client is cached on `global` so hot reloads don't open a new
// pool each time. Only reuse it if it was built from the *current* generated
// client: after `prisma generate`, hot reload brings in a new PrismaClient
// class, and an instance of the old one doesn't know the new schema (queries
// on new columns throw, and getCurrentUser() then looks signed out).
const cached = globalForPrisma.prisma
const prisma =
  cached instanceof PrismaClient ? cached : new PrismaClient({ adapter })

// a client from before `prisma generate`: close its pool instead of leaking it
if (cached && cached !== prisma) void cached.$disconnect()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
