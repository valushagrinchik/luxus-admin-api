/*
  Warnings:

  - Changed the type of `bankAccountType` on the `plantation_transfer_details` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('CURRENT', 'SAVINGS');

-- AlterTable
ALTER TABLE "plantation_transfer_details" DROP COLUMN "bankAccountType",
ADD COLUMN     "bankAccountType" "BankAccountType" NOT NULL ;
