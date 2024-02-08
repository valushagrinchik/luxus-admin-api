import { Group as GroupPrisma } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Group implements GroupPrisma {
  id: number;
  name: string;

  @Exclude()
  deleted: boolean;

  deletedAt: Date;

  @Exclude()
  deletedBy: number;

  constructor(partial: Partial<Group>) {
    Object.assign(this, partial);
  }
}
