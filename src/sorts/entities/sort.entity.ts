import { Sort as SortPrisma } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Sort implements SortPrisma {
  id: number;
  name: string;
  categoryId: number;

  @Exclude()
  deleted: boolean;

  @Exclude()
  deletedAt: Date;

  @Exclude()
  deletedBy: number;

  constructor(partial: Partial<Sort>) {
    Object.assign(this, partial);
  }
}
