/*
  Warnings:

  - A unique constraint covering the columns `[addedBy]` on the table `branding` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "branding_addedBy_key" ON "branding"("addedBy");
