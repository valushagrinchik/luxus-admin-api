import { Group as GroupPrisma } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Group implements GroupPrisma {
  id: number;
  name: string;
  deletedAt: Date;
  deletedBy: number;

  @Exclude()
  deleted: boolean;

  constructor(partial: GroupPrisma) {
    Object.assign(this, partial);
  }
}
