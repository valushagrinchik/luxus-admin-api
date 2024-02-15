import { Category as CategoryPrisma } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Category implements CategoryPrisma {
  id: number;
  name: string;
  deletedAt: Date;
  groupId: number;
  deletedBy: number;

  @Exclude()
  deleted: boolean;

  constructor(partial: CategoryPrisma) {
    Object.assign(this, partial);
  }
}
