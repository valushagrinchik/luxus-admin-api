import { Sort as SortPrisma } from '@prisma/client';

export class Sort {
  id: number;
  name: string;
  categoryId: number;

  deletedAt: Date;

  constructor(partial: SortPrisma) {
    Object.assign(this, partial);
  }
}
