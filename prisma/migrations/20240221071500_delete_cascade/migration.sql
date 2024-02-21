-- DropForeignKey
ALTER TABLE "plantation_checks" DROP CONSTRAINT "plantation_checks_plantationLegalEntityId_fkey";

-- DropForeignKey
ALTER TABLE "plantation_transfer_details" DROP CONSTRAINT "plantation_transfer_details_plantationLegalEntityId_fkey";

-- AddForeignKey
ALTER TABLE "plantation_transfer_details" ADD CONSTRAINT "plantation_transfer_details_plantationLegalEntityId_fkey" FOREIGN KEY ("plantationLegalEntityId") REFERENCES "plantation_legal_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantation_checks" ADD CONSTRAINT "plantation_checks_plantationLegalEntityId_fkey" FOREIGN KEY ("plantationLegalEntityId") REFERENCES "plantation_legal_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
