/*
  Warnings:

  - The values [mobileAndDestop] on the enum `Platform` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Platform_new" AS ENUM ('desktop', 'mobileAndDesktop');
ALTER TABLE "tests" ALTER COLUMN "platform" DROP DEFAULT;
ALTER TABLE "tests" ALTER COLUMN "platform" TYPE "Platform_new" USING ("platform"::text::"Platform_new");
ALTER TYPE "Platform" RENAME TO "Platform_old";
ALTER TYPE "Platform_new" RENAME TO "Platform";
DROP TYPE "Platform_old";
ALTER TABLE "tests" ALTER COLUMN "platform" SET DEFAULT 'desktop';
COMMIT;
