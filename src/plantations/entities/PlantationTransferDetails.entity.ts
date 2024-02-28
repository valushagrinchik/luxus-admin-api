import {
  BankAccountType,
  PlantationTransferDetails as PlantationTransferDetailsPrisma,
} from '@prisma/client';
import { Exclude, Transform } from 'class-transformer';
import { Upload } from 'src/uploads/entities/Upload.entity';

export class PlantationTransferDetails
  implements PlantationTransferDetailsPrisma
{
  id: number;
  name: string;
  favourite: boolean;
  beneficiary: string;
  beneficiaryAddress: string | null;
  bank: string;
  bankAddress: string | null;
  bankAccountNumber: string;
  bankAccountType: BankAccountType;
  bankSwift: string | null;
  correspondentBank: string | null;
  correspondentBankAddress: string | null;
  correspondentBankAccountNumber: string | null;
  correspondentBankSwift: string | null;
  @Exclude()
  plantationId: number;
  plantationLegalEntityId: number;
  documentId: number | null;

  @Transform(({ value }) => {
    return value ? new Upload(value) : null;
  })
  document: Upload;

  constructor(partial: PlantationTransferDetailsPrisma) {
    Object.assign(this, partial);
  }
}
