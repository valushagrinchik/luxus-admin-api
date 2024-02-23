import {
  PlantationContacts as PlantationContactsPrisma,
  PlantationDepartmanet,
} from '@prisma/client';
import { Exclude } from 'class-transformer';

export class PlantationContacts implements PlantationContactsPrisma {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  telegram: string;
  skype: string;
  position: string;
  department: PlantationDepartmanet;
  @Exclude()
  plantationId: number;

  constructor(partial: PlantationContactsPrisma) {
    Object.assign(this, partial);
  }
}
