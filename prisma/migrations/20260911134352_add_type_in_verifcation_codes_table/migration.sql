/*
  Warnings:

  - Added the required column `type` to the `EmailVerificationCode` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerificationCodeType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "EmailVerificationCode" ADD COLUMN     "type" "VerificationCodeType" NOT NULL;
