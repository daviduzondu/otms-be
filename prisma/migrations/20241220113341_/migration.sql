/*
  Warnings:

  - Added the required column `currentQuestion` to the `test_attempts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "test_attempts" ADD COLUMN     "currentQuestion" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_currentQuestion_fkey" FOREIGN KEY ("currentQuestion") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
