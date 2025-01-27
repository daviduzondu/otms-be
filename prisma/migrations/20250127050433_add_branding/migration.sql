-- CreateTable
CREATE TABLE "branding" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testId" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "field1" TEXT,
    "field2" TEXT,
    "field3" TEXT,

    CONSTRAINT "branding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "branding_testId_addedBy_key" ON "branding"("testId", "addedBy");

-- AddForeignKey
ALTER TABLE "branding" ADD CONSTRAINT "branding_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branding" ADD CONSTRAINT "branding_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
