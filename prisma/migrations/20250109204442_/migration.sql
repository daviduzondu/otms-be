/*
  Warnings:

  - You are about to drop the column `showCorrectAnswers` on the `tests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tests" DROP COLUMN "showCorrectAnswers",
ADD COLUMN     "showResultsAfterTest" BOOLEAN NOT NULL DEFAULT false;
