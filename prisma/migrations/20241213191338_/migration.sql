/*
  Warnings:

  - You are about to drop the `student_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "student_tokens" DROP CONSTRAINT "student_tokens_studentId_fkey";

-- DropForeignKey
ALTER TABLE "student_tokens" DROP CONSTRAINT "student_tokens_testId_fkey";

-- AlterTable
ALTER TABLE "tests" ADD COLUMN     "studentTokens" TEXT[];

-- DropTable
DROP TABLE "student_tokens";
