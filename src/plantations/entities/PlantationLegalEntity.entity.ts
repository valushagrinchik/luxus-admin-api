import { PlantationLegalEntity as PlantationLegalEntityPrisma } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class PlantationLegalEntity implements PlantationLegalEntityPrisma {
  id: number;
  name: string;
  code: string;
  legalAddress: string;
  actualAddress: string;
  @Exclude()
  plantationId: number;
  constructor(partial: PlantationLegalEntityPrisma) {
    Object.assign(this, partial);
  }
}
