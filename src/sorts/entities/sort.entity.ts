import { Sort as SortPrisma } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Sort implements SortPrisma {
  id: number;
  name: string;
  categoryId: number;
  deletedAt: Date;
  deletedBy: number;

  @Exclude()
  deleted: boolean;

  constructor(partial: SortPrisma) {
    Object.assign(this, partial);
  }
}
