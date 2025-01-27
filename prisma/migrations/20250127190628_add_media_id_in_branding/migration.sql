/*
  Warnings:

  - Added the required column `mediaId` to the `branding` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "branding" ADD COLUMN     "mediaId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "branding" ADD CONSTRAINT "branding_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
