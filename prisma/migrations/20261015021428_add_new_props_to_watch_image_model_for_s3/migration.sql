/*
  Warnings:

  - You are about to drop the column `logoUrl` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `WatchImage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `WatchImage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contentType` to the `WatchImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `WatchImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeBytes` to the `WatchImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "WatchImage_watchId_sortOrder_key";

-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "logoUrl",
ADD COLUMN     "logoKey" TEXT;

-- AlterTable
ALTER TABLE "Watch" ALTER COLUMN "isActive" SET DEFAULT false;

-- AlterTable
ALTER TABLE "WatchImage" DROP COLUMN "url",
ADD COLUMN     "alt" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "contentType" TEXT NOT NULL,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "sizeBytes" INTEGER NOT NULL,
ADD COLUMN     "width" INTEGER,
ALTER COLUMN "sortOrder" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "WatchImage_key_key" ON "WatchImage"("key");
