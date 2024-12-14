/*
  Warnings:

  - Added the required column `accessCode` to the `student_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "student_tokens" ADD COLUMN     "accessCode" TEXT NOT NULL;
