-- DropIndex
DROP INDEX "VerificationCode_userId_idx";

-- CreateIndex
CREATE INDEX "CartItem_watchId_idx" ON "CartItem"("watchId");

-- CreateIndex
CREATE INDEX "FavoriteWatch_watchId_idx" ON "FavoriteWatch"("watchId");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_watchId_idx" ON "OrderItem"("watchId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "VerificationCode_userId_type_idx" ON "VerificationCode"("userId", "type");

-- CreateIndex
CREATE INDEX "VerificationCode_expiresAt_idx" ON "VerificationCode"("expiresAt");

-- CreateIndex
CREATE INDEX "Watch_brandId_idx" ON "Watch"("brandId");

-- CreateIndex
CREATE INDEX "Watch_isActive_createdAt_idx" ON "Watch"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "Watch_isActive_priceCents_idx" ON "Watch"("isActive", "priceCents");
