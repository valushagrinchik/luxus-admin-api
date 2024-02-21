import { IsNotEmpty } from 'class-validator';

export class TransferDetails {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  favourite: boolean;

  @IsNotEmpty()
  beneficiary: string;
  beneficiaryAddress: string;
  documentPath: any;

  @IsNotEmpty()
  bank: string;
  bankAddress: string;
  @IsNotEmpty()
  bankAccountNumber: string;
  @IsNotEmpty()
  bankAccountType: string;
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
  documentPath: any;
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
  department: string;
}

export class CreatePlantationDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  country: string;

  comments: string;

  deliveryMethod: string;
  termsOfPayment: string;

  postpaidCredit: string;
  postpaidDays: string;

  @IsNotEmpty()
  legalEntities: LegalEntity[];
  @IsNotEmpty()
  contacts: Contact[];
}
