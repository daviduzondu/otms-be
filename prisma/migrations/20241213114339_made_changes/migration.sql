/*
  Warnings:

  - You are about to drop the `student_answers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[testId,studentId]` on the table `test_participants` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "student_answers" DROP CONSTRAINT "student_answers_questionId_fkey";

-- DropForeignKey
ALTER TABLE "student_answers" DROP CONSTRAINT "student_answers_studentId_fkey";

-- DropForeignKey
ALTER TABLE "student_answers" DROP CONSTRAINT "student_answers_testId_fkey";

-- DropTable
DROP TABLE "student_answers";

-- CreateTable
CREATE TABLE "student_grading" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "studentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "isTouched" BOOLEAN NOT NULL DEFAULT false,
    "point" INTEGER NOT NULL DEFAULT 0,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_grading_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_grading_questionId_studentId_testId_key" ON "student_grading"("questionId", "studentId", "testId");

-- CreateIndex
CREATE UNIQUE INDEX "test_participants_testId_studentId_key" ON "test_participants"("testId", "studentId");

-- AddForeignKey
ALTER TABLE "student_grading" ADD CONSTRAINT "student_grading_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_grading" ADD CONSTRAINT "student_grading_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_grading" ADD CONSTRAINT "student_grading_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
