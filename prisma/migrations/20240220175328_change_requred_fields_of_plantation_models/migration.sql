-- AlterTable
ALTER TABLE "plantation_transfer_details" ALTER COLUMN "beneficiaryAddress" DROP NOT NULL,
ALTER COLUMN "bankAddress" DROP NOT NULL,
ALTER COLUMN "bankSwift" DROP NOT NULL;
