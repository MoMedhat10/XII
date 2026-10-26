/*
  Warnings:

  - Made the column `logoKey` on table `Brand` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Brand" ALTER COLUMN "logoKey" SET NOT NULL;
