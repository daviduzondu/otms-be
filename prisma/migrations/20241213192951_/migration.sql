/*
  Warnings:

  - A unique constraint covering the columns `[testId,studentId,accessCode]` on the table `student_tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "student_tokens_testId_studentId_accessCode_key" ON "student_tokens"("testId", "studentId", "accessCode");
