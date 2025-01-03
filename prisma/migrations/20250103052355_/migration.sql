/*
  Warnings:

  - You are about to drop the column `teacherId` on the `media` table. All the data in the column will be lost.
  - Added the required column `uploader` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_teacherId_fkey";

-- AlterTable
ALTER TABLE "media" DROP COLUMN "teacherId",
ADD COLUMN     "uploader" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploader_fkey" FOREIGN KEY ("uploader") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
