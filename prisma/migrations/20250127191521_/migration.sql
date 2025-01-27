/*
  Warnings:

  - A unique constraint covering the columns `[testId]` on the table `branding` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "branding_testId_addedBy_key";

-- CreateIndex
CREATE UNIQUE INDEX "branding_testId_key" ON "branding"("testId");
