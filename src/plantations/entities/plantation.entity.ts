import {
  ChecksDeliveryMethod,
  PlantationChecks,
  PlantationContacts,
  PlantationLegalEntity,
  Plantation as PlantationPrisma,
  PlantationTransferDetails,
  TermsOfPayment,
} from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Plantation implements PlantationPrisma {
  id: number;
  name: string;

  country: string;
  comments: string | null;
  deliveryMethod: ChecksDeliveryMethod;
  termsOfPayment: TermsOfPayment;
  postpaidCredit: number | null;
  postpaidDays: number | null;

  legalEntities: PlantationLegalEntity[];
  contacts: PlantationContacts[];
  transferDetails: PlantationTransferDetails[];
  checks: PlantationChecks[];

  deletedAt: Date;
  deletedBy: number;

  @Exclude()
  deleted: boolean;

  constructor(partial: PlantationPrisma) {
    Object.assign(this, partial);
  }
}
