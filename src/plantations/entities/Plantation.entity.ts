import {
  ChecksDeliveryMethod,
  Plantation as PlantationPrisma,
  TermsOfPayment,
} from '@prisma/client';
import { Exclude, Transform } from 'class-transformer';
import { PlantationLegalEntity } from './PlantationLegalEntity.entity';
import { PlantationChecks } from './PlantationChecks.entity';
import { PlantationTransferDetails } from './PlantationTransferDetails.entity';
import { PlantationContacts } from './PlantationContacts.entity';

export class Plantation implements PlantationPrisma {
  id: number;
  name: string;

  country: string;
  comments: string | null;
  deliveryMethod: ChecksDeliveryMethod;
  deliveryInfo: string;

  termsOfPayment: TermsOfPayment;
  postpaidCredit: number | null;
  postpaidDays: number | null;

  @Transform(({ value }) => {
    return value.map((obj: any) => new PlantationLegalEntity(obj));
  })
  legalEntities: PlantationLegalEntity[];

  @Transform(({ value }) => {
    return value.map((obj: any) => new PlantationContacts(obj));
  })
  contacts: PlantationContacts[];

  @Transform(({ value }) => {
    return value.map((obj: any) => new PlantationTransferDetails(obj));
  })
  transferDetails: PlantationTransferDetails[];

  @Transform(({ value }) => {
    return value.map((obj: any) => new PlantationChecks(obj));
  })
  checks: PlantationChecks[];

  deletedAt: Date;
  deletedBy: number;

  @Exclude()
  deleted: boolean;

  constructor(partial: PlantationPrisma) {
    Object.assign(this, partial);
  }
}
