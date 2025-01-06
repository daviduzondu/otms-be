/*
  Warnings:

  - The values [pdf] on the enum `MediaType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MediaType_new" AS ENUM ('image', 'video', 'audio');
ALTER TABLE "media" ALTER COLUMN "type" TYPE "MediaType_new" USING ("type"::text::"MediaType_new");
ALTER TYPE "MediaType" RENAME TO "MediaType_old";
ALTER TYPE "MediaType_new" RENAME TO "MediaType";
DROP TYPE "MediaType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_uploader_fkey";

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "studentId" TEXT,
ADD COLUMN     "testId" TEXT,
ALTER COLUMN "uploader" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploader_fkey" FOREIGN KEY ("uploader") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
