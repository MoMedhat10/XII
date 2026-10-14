-- Convert money columns from DECIMAL dollars to INTEGER cents, preserving data.

-- Watch.price -> priceCents
ALTER TABLE "Watch" ADD COLUMN "priceCents" INTEGER;
UPDATE "Watch" SET "priceCents" = ROUND("price" * 100)::INTEGER;
ALTER TABLE "Watch" ALTER COLUMN "priceCents" SET NOT NULL;
ALTER TABLE "Watch" DROP COLUMN "price";

-- Order.total -> totalCents
ALTER TABLE "Order" ADD COLUMN "totalCents" INTEGER;
UPDATE "Order" SET "totalCents" = ROUND("total" * 100)::INTEGER;
ALTER TABLE "Order" ALTER COLUMN "totalCents" SET NOT NULL;
ALTER TABLE "Order" DROP COLUMN "total";

-- OrderItem.unitPrice -> unitPriceCents
ALTER TABLE "OrderItem" ADD COLUMN "unitPriceCents" INTEGER;
UPDATE "OrderItem" SET "unitPriceCents" = ROUND("unitPrice" * 100)::INTEGER;
ALTER TABLE "OrderItem" ALTER COLUMN "unitPriceCents" SET NOT NULL;
ALTER TABLE "OrderItem" DROP COLUMN "unitPrice";
