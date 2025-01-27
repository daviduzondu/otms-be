/*
  Warnings:

  - You are about to drop the column `brandingId` on the `tests` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tests" DROP CONSTRAINT "tests_brandingId_fkey";

-- AlterTable
ALTER TABLE "tests" DROP COLUMN "brandingId",
ADD COLUMN     "brandingEnable" BOOLEAN NOT NULL DEFAULT false;
