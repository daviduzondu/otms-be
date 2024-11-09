/*
  Warnings:

  - Added the required column `addedBy` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: Add the column as nullable first
ALTER TABLE "students" ADD COLUMN "addedBy" TEXT;

-- Step 2: Populate "addedBy" with the ID of the teacher where email is 'davidclement216@gmail.com'
UPDATE "students"
SET "addedBy" = (SELECT "id" FROM "teachers" WHERE "email" = 'davidclement216@gmail.com')
WHERE "addedBy" IS NULL;

-- Step 3: Alter the column to be non-nullable now that it’s populated
ALTER TABLE "students" ALTER COLUMN "addedBy" SET NOT NULL;

-- Step 4: Add the foreign key constraint
ALTER TABLE "students"
ADD CONSTRAINT "students_addedBy_fkey"
FOREIGN KEY ("addedBy") REFERENCES "teachers"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
