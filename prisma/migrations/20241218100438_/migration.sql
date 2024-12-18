/*
  Warnings:

  - You are about to drop the column `navigationTime` on the `student_grading` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student_grading" DROP COLUMN "navigationTime",
ADD COLUMN     "startedAt" TIMESTAMP(3);
