/*
  Warnings:

  - You are about to drop the column `participants` on the `tests` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tests" DROP COLUMN "participants";

-- CreateTable
CREATE TABLE "test_participants" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "studentId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_participants_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "test_participants" ADD CONSTRAINT "test_participants_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_participants" ADD CONSTRAINT "test_participants_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
