/*
  Warnings:

  - You are about to drop the `institutions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "teachers" DROP CONSTRAINT "teachers_institutionId_fkey";

-- DropForeignKey
ALTER TABLE "tests" DROP CONSTRAINT "tests_institutionId_fkey";

-- DropTable
DROP TABLE "institutions";
