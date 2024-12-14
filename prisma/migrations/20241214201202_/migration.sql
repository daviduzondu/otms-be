-- DropForeignKey
ALTER TABLE "test_participants" DROP CONSTRAINT "test_participants_origin_fkey";

-- AlterTable
ALTER TABLE "test_participants" ALTER COLUMN "origin" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "test_participants" ADD CONSTRAINT "test_participants_origin_fkey" FOREIGN KEY ("origin") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
