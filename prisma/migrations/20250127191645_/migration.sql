/*
  Warnings:

  - You are about to drop the column `testId` on the `branding` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "branding" DROP CONSTRAINT "branding_testId_fkey";

-- DropIndex
DROP INDEX "branding_testId_key";

-- AlterTable
ALTER TABLE "branding" DROP COLUMN "testId";

-- AlterTable
ALTER TABLE "tests" ADD COLUMN     "brandingId" TEXT;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_brandingId_fkey" FOREIGN KEY ("brandingId") REFERENCES "branding"("id") ON DELETE SET NULL ON UPDATE CASCADE;
