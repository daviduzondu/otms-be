/*
  Warnings:

  - You are about to drop the column `studentTokens` on the `tests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tests" DROP COLUMN "studentTokens";

-- CreateTable
CREATE TABLE "student_tokens" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "studentId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_tokens_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "student_tokens" ADD CONSTRAINT "student_tokens_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_tokens" ADD CONSTRAINT "student_tokens_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
