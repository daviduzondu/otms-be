/*
  Warnings:

  - You are about to drop the column `isCorrect` on the `student_grading` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "student_grading" DROP COLUMN "isCorrect",
ADD COLUMN     "autoGraded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "overridden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tests" ALTER COLUMN "requireFullScreen" SET DEFAULT true;
