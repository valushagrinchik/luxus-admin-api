import {
  ChecksDeliveryMethod,
  PlantationLegalEntity as PlantationLegalEntityPrisma,
  Plantation as PlantationPrisma,
  TermsOfPayment,
} from '@prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';

export class PlantationLegalEntity implements PlantationLegalEntityPrisma {
  id: number;
  name: string;
  code: string;
  legalAddress: string;
  actualAddress: string;
  plantationId: number;
  constructor(partial: PlantationPrisma) {
    Object.assign(this, partial);
  }
}

export class PlantationThin implements PlantationPrisma {
  id: number;
  name: string;

  country: string;
  comments: string | null;
  deliveryMethod: ChecksDeliveryMethod;
  termsOfPayment: TermsOfPayment;
  postpaidCredit: number | null;
  postpaidDays: number | null;

  @Transform(({ value }) => {
    return value.map((obj: any) => new PlantationLegalEntity(obj));
  })
  legalEntities: PlantationLegalEntity[];

  @Expose()
  get legalEntitiesNames(): string[] {
    return this.legalEntities.map((entity) => entity.name);
  }

  deletedAt: Date;
  deletedBy: number;

  @Exclude()
  deleted: boolean;

  constructor(partial: PlantationPrisma) {
    Object.assign(this, partial);
  }
}
