import { Category as CategoryPrisma } from '@prisma/client';

export class Category {
  id: number;
  name: string;
  categoryId: number;
  deletedAt: Date;

  constructor(partial: CategoryPrisma) {
    Object.assign(this, partial);
  }
}
