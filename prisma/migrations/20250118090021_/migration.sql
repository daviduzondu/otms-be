/*
  Warnings:

  - You are about to drop the column `institutionId` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `institutionId` on the `tests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "institutionId";

-- AlterTable
ALTER TABLE "tests" DROP COLUMN "institutionId";
