/*
  Warnings:

  - You are about to drop the column `authType` on the `teachers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "authType";

-- DropEnum
DROP TYPE "AuthType";

-- DropEnum
DROP TYPE "TestStatus";
