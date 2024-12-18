/*
  Warnings:

  - A unique constraint covering the columns `[questionId,studentId,testId,startedAt]` on the table `student_grading` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "student_grading_questionId_studentId_testId_key";

-- CreateIndex
CREATE UNIQUE INDEX "student_grading_questionId_studentId_testId_startedAt_key" ON "student_grading"("questionId", "studentId", "testId", "startedAt");
