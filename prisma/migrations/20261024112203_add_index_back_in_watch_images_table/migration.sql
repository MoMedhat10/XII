/*
  Warnings:

  - A unique constraint covering the columns `[watchId,sortOrder]` on the table `WatchImage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WatchImage_watchId_sortOrder_key" ON "WatchImage"("watchId", "sortOrder");
