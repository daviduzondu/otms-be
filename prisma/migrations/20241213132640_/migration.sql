/*
  Warnings:

  - You are about to drop the `test_participants` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "test_participants" DROP CONSTRAINT "test_participants_studentId_fkey";

-- DropForeignKey
ALTER TABLE "test_participants" DROP CONSTRAINT "test_participants_testId_fkey";

-- AlterTable
ALTER TABLE "tests" ADD COLUMN     "participants" TEXT[];

-- DropTable
DROP TABLE "test_participants";
