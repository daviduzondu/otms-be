-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('desktop', 'mobileAndDestop');

-- AlterTable
ALTER TABLE "tests" ADD COLUMN     "platform" "Platform" NOT NULL DEFAULT 'desktop';
