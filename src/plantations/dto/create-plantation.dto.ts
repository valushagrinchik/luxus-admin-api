import {
  BankAccountType,
  ChecksDeliveryMethod,
  PlantationDepartmanet,
  TermsOfPayment,
} from '@prisma/client';
import { IsNotEmpty } from 'class-validator';
export class Document {
  id: number;
  name: string;
}
export class TransferDetails {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  favourite: boolean;

  @IsNotEmpty()
  beneficiary: string;
  beneficiaryAddress: string;
  document?: Document;

  @IsNotEmpty()
  bank: string;
  bankAddress: string;
  @IsNotEmpty()
  bankAccountNumber: string;
  @IsNotEmpty()
  bankAccountType: BankAccountType;
  bankSwift: string;

  correspondentBank: string;
  correspondentBankAddress: string;
  correspondentBankAccountNumber: string;
  correspondentBankSwift: string;
}

export class PlantationChecks {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  favourite: boolean;
  @IsNotEmpty()
  beneficiary: string;
  document?: Document;
}

export class LegalEntity {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  code: string;
  @IsNotEmpty()
  legalAddress: string;
  @IsNotEmpty()
  actualAddress: string;

  @IsNotEmpty()
  transferDetails: TransferDetails[];
  @IsNotEmpty()
  checks: PlantationChecks[];
}

export class Contact {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  whatsapp: string;
  @IsNotEmpty()
  telegram: string;
  @IsNotEmpty()
  skype: string;
  @IsNotEmpty()
  position: string;
  @IsNotEmpty()
  department: PlantationDepartmanet;
}

export class CreatePlantationDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  country: string;

  comments: string;

  deliveryMethod: ChecksDeliveryMethod;
  deliveryInfo: string;
  termsOfPayment: TermsOfPayment;

  postpaidCredit: string;
  postpaidDays: string;

  @IsNotEmpty()
  legalEntities: LegalEntity[];
  @IsNotEmpty()
  contacts: Contact[];
}
