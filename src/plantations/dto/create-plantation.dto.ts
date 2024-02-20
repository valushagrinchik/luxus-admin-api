import { IsNotEmpty } from 'class-validator';

class TransferDetails {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  favourite: boolean;

  @IsNotEmpty()
  beneficiary: string;
  beneficiaryAddress: string;
  documentPath: string;

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

class PlantationChecks {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  favourite: boolean;
  @IsNotEmpty()
  beneficiary: string;
  documentPath: string;
}

class LegalEntity {
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

class Contact {
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

  postpaidCredit: number;
  postpaidDays: number;

  @IsNotEmpty()
  legalEntities: LegalEntity[];
  @IsNotEmpty()
  contacts: Contact[];
}
