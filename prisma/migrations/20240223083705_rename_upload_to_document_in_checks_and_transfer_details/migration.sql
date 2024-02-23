/*
  Warnings:

  - You are about to drop the column `uploadId` on the `plantation_checks` table. All the data in the column will be lost.
  - You are about to drop the column `uploadId` on the `plantation_transfer_details` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documentId]` on the table `plantation_checks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[documentId]` on the table `plantation_transfer_details` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "plantation_checks" DROP CONSTRAINT "plantation_checks_uploadId_fkey";

-- DropForeignKey
ALTER TABLE "plantation_transfer_details" DROP CONSTRAINT "plantation_transfer_details_uploadId_fkey";

-- DropIndex
DROP INDEX "plantation_checks_uploadId_key";

-- DropIndex
DROP INDEX "plantation_transfer_details_uploadId_key";

-- AlterTable
ALTER TABLE "plantation_checks" DROP COLUMN "uploadId",
ADD COLUMN     "documentId" INTEGER;

-- AlterTable
ALTER TABLE "plantation_transfer_details" DROP COLUMN "uploadId",
ADD COLUMN     "documentId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "plantation_checks_documentId_key" ON "plantation_checks"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "plantation_transfer_details_documentId_key" ON "plantation_transfer_details"("documentId");

-- AddForeignKey
ALTER TABLE "plantation_transfer_details" ADD CONSTRAINT "plantation_transfer_details_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantation_checks" ADD CONSTRAINT "plantation_checks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "uploads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
