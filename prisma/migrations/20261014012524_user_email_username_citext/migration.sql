-- Case-insensitive text type
CREATE EXTENSION IF NOT EXISTS citext;

-- Normalise existing emails before the type change
UPDATE "User" SET "email" = lower(trim("email"));

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET DATA TYPE CITEXT,
ALTER COLUMN "username" SET DATA TYPE CITEXT;
