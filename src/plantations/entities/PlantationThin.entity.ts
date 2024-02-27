import {
  ChecksDeliveryMethod,
  Plantation as PlantationPrisma,
  TermsOfPayment,
} from '@prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';
import { PlantationLegalEntity } from './PlantationLegalEntity.entity';

export class PlantationThin implements PlantationPrisma {
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
