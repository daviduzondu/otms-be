/*
  Warnings:

  - You are about to drop the column `submittedInTime` on the `student_grading` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student_grading" DROP COLUMN "submittedInTime",
ADD COLUMN     "navigationTime" TIMESTAMP(3);
