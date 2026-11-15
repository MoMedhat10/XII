import "dotenv/config"; 
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: `tsx prisma/seed.ts`, 
  },
  datasource: {
    // Not env("DATABASE_URL"): that throws when the variable is missing, and
    // `prisma generate` (run by postinstall) must work without a database,
    // e.g. on a fresh clone. Commands that need one still fail clearly.
    url: process.env.DATABASE_URL ?? "",
  },
});