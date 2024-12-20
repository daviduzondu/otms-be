/*
  Warnings:

  - Added the required column `submittedAt` to the `test_attempts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "test_attempts" ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL;
