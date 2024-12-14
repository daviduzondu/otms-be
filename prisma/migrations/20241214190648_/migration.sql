/*
  Warnings:

  - A unique constraint covering the columns `[testId,studentId]` on the table `test_participants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `origin` to the `test_participants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "test_participants" ADD COLUMN     "origin" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "test_participants_testId_studentId_key" ON "test_participants"("testId", "studentId");

-- AddForeignKey
ALTER TABLE "test_participants" ADD CONSTRAINT "test_participants_origin_fkey" FOREIGN KEY ("origin") REFERENCES "student_class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
