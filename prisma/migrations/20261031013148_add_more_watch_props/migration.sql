-- CreateEnum
CREATE TYPE "WatchGender" AS ENUM ('MEN', 'WOMEN', 'UNISEX');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('AUTOMATIC', 'MANUAL', 'QUARTZ', 'SOLAR', 'SMART');

-- CreateEnum
CREATE TYPE "WatchCondition" AS ENUM ('NEW', 'PRE_OWNED', 'REFURBISHED');

-- AlterTable
ALTER TABLE "Watch" ADD COLUMN     "caliber" TEXT,
ADD COLUMN     "caseMaterial" TEXT,
ADD COLUMN     "condition" "WatchCondition",
ADD COLUMN     "gender" "WatchGender",
ADD COLUMN     "movement" "MovementType";
