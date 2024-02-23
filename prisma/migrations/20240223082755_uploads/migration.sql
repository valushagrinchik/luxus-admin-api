/*
  Warnings:

  - You are about to drop the column `documentPath` on the `plantation_checks` table. All the data in the column will be lost.
  - You are about to drop the column `documentPath` on the `plantation_transfer_details` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uploadId]` on the table `plantation_checks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uploadId]` on the table `plantation_transfer_details` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "plantation_checks" DROP COLUMN "documentPath",
ADD COLUMN     "uploadId" INTEGER;

-- AlterTable
ALTER TABLE "plantation_transfer_details" DROP COLUMN "documentPath",
ADD COLUMN     "uploadId" INTEGER;

-- CreateTable
CREATE TABLE "uploads" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "size" INTEGER NOT NULL,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plantation_checks_uploadId_key" ON "plantation_checks"("uploadId");

-- CreateIndex
CREATE UNIQUE INDEX "plantation_transfer_details_uploadId_key" ON "plantation_transfer_details"("uploadId");

-- AddForeignKey
ALTER TABLE "plantation_transfer_details" ADD CONSTRAINT "plantation_transfer_details_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantation_checks" ADD CONSTRAINT "plantation_checks_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
