-- CreateEnum
CREATE TYPE "ChecksDeliveryMethod" AS ENUM ('PERSONALLY', 'SERVIENTREGA');

-- CreateEnum
CREATE TYPE "TermsOfPayment" AS ENUM ('PREPAID', 'PAIDUPONACTUAL', 'POSTPAID');

-- CreateEnum
CREATE TYPE "PlantationDepartmanet" AS ENUM ('FINANCIAL', 'SALES');

-- CreateTable
CREATE TABLE "plantations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "comments" TEXT,
    "deliveryMethod" "ChecksDeliveryMethod" NOT NULL DEFAULT 'PERSONALLY',
    "termsOfPayment" "TermsOfPayment" NOT NULL DEFAULT 'PAIDUPONACTUAL',
    "postpaidCredit" DOUBLE PRECISION,
    "postpaidDays" INTEGER,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" INTEGER,

    CONSTRAINT "plantations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantation_legal_entities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "legalAddress" TEXT NOT NULL,
    "actualAddress" TEXT NOT NULL,
    "plantationId" INTEGER NOT NULL,

    CONSTRAINT "plantation_legal_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantation_contacts" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "telegram" TEXT NOT NULL,
    "skype" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "department" "PlantationDepartmanet" NOT NULL,
    "plantationId" INTEGER NOT NULL,

    CONSTRAINT "plantation_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantation_transfer_details" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "favourite" BOOLEAN NOT NULL DEFAULT false,
    "beneficiary" TEXT NOT NULL,
    "beneficiaryAddress" TEXT NOT NULL,
    "documentPath" TEXT,
    "bank" TEXT NOT NULL,
    "bankAddress" TEXT NOT NULL,
    "bankAccountNumber" TEXT NOT NULL,
    "bankAccountType" TEXT NOT NULL,
    "bankSwift" TEXT NOT NULL,
    "correspondentBank" TEXT,
    "correspondentBankAddress" TEXT,
    "correspondentBankAccountNumber" TEXT,
    "correspondentBankSwift" TEXT,
    "plantationId" INTEGER NOT NULL,
    "plantationLegalEntityId" INTEGER NOT NULL,

    CONSTRAINT "plantation_transfer_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantation_checks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "beneficiary" TEXT NOT NULL,
    "documentPath" TEXT,
    "favourite" BOOLEAN NOT NULL DEFAULT false,
    "plantationId" INTEGER NOT NULL,
    "plantationLegalEntityId" INTEGER NOT NULL,

    CONSTRAINT "plantation_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plantations_name_country_deleted_key" ON "plantations"("name", "country", "deleted");

-- CreateIndex
CREATE UNIQUE INDEX "plantation_legal_entities_name_plantationId_key" ON "plantation_legal_entities"("name", "plantationId");

-- CreateIndex
CREATE UNIQUE INDEX "plantation_contacts_plantationId_department_email_key" ON "plantation_contacts"("plantationId", "department", "email");

-- AddForeignKey
ALTER TABLE "plantation_legal_entities" ADD CONSTRAINT "plantation_legal_entities_plantationId_fkey" FOREIGN KEY ("plantationId") REFERENCES "plantations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantation_contacts" ADD CONSTRAINT "plantation_contacts_plantationId_fkey" FOREIGN KEY ("plantationId") REFERENCES "plantations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantation_transfer_details" ADD CONSTRAINT "plantation_transfer_details_plantationId_fkey" FOREIGN KEY ("plantationId") REFERENCES "plantations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantation_transfer_details" ADD CONSTRAINT "plantation_transfer_details_plantationLegalEntityId_fkey" FOREIGN KEY ("plantationLegalEntityId") REFERENCES "plantation_legal_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantation_checks" ADD CONSTRAINT "plantation_checks_plantationId_fkey" FOREIGN KEY ("plantationId") REFERENCES "plantations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantation_checks" ADD CONSTRAINT "plantation_checks_plantationLegalEntityId_fkey" FOREIGN KEY ("plantationLegalEntityId") REFERENCES "plantation_legal_entities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
