import { PrismaClient, Prisma } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData: Prisma.UserCreateInput[] = [
  {
    username: "Alice",
    email: "alice@prisma.io",
    passwordHash: "hash_alice_secret",
  },
  {
    username: "Bob",
    email: "bob@prisma.io",
    passwordHash: "hash_bob_secret",
  },
];

export async function main() {
  for (const u of userData) {
    await prisma.user.create({ data: u });
  }
}

main();