/*
  Warnings:

  - The `timeLimit` column on the `questions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "questions" DROP COLUMN "timeLimit",
ADD COLUMN     "timeLimit" INTEGER;
