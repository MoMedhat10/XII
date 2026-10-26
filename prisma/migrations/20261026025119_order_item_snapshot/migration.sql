-- Snapshot of what was bought on each order line.
-- Added nullable, filled from the current watch/brand, then made required,
-- so this also works when order items already exist.

-- 1. add
ALTER TABLE "OrderItem"
  ADD COLUMN "watchName"  TEXT,
  ADD COLUMN "watchModel" TEXT,
  ADD COLUMN "brandName"  TEXT,
  ADD COLUMN "imageKey"   TEXT;

-- 2. fill existing rows (imageKey stays NULL: old rows have no image copy)
UPDATE "OrderItem" AS oi
SET "watchName"  = w."name",
    "watchModel" = w."model",
    "brandName"  = b."name"
FROM "Watch" AS w
JOIN "Brand" AS b ON b."id" = w."brandId"
WHERE w."id" = oi."watchId";

-- 3. require
ALTER TABLE "OrderItem"
  ALTER COLUMN "watchName"  SET NOT NULL,
  ALTER COLUMN "watchModel" SET NOT NULL,
  ALTER COLUMN "brandName"  SET NOT NULL;
