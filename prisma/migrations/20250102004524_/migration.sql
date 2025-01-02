/*
  Warnings:

  - You are about to drop the column `overridden` on the `student_grading` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student_grading" DROP COLUMN "overridden";

-- AlterTable
ALTER TABLE "test_participants" ADD COLUMN     "graded" BOOLEAN NOT NULL DEFAULT false;
