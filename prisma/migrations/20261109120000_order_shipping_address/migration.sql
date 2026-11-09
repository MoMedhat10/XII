-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "checkoutKey" TEXT,
ADD COLUMN     "shipCity" TEXT,
ADD COLUMN     "shipCountry" TEXT,
ADD COLUMN     "shipLine1" TEXT,
ADD COLUMN     "shipLine2" TEXT,
ADD COLUMN     "shipName" TEXT,
ADD COLUMN     "shipPhone" TEXT,
ADD COLUMN     "shipPostalCode" TEXT,
ADD COLUMN     "shipRegion" TEXT;

-- AlterTable
ALTER TABLE "Watch" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Order_checkoutKey_key" ON "Order"("checkoutKey");

