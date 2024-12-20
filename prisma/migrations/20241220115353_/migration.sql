/*
  Warnings:

  - You are about to drop the column `currentQuestion` on the `test_attempts` table. All the data in the column will be lost.
  - Added the required column `currentQuestionId` to the `test_attempts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "test_attempts" DROP CONSTRAINT "test_attempts_currentQuestion_fkey";

-- AlterTable
ALTER TABLE "test_attempts" DROP COLUMN "currentQuestion",
ADD COLUMN     "currentQuestionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_currentQuestionId_fkey" FOREIGN KEY ("currentQuestionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
