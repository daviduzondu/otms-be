/*
  Warnings:

  - Added the required column `answer` to the `student_grading` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "student_grading" ADD COLUMN     "answer" TEXT NOT NULL;
