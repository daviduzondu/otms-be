/*
  Warnings:

  - Added the required column `submittedAt` to the `student_grading` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "student_grading" ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL;
