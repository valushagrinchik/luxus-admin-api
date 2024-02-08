import { Group as GroupPrisma } from '@prisma/client';

export class Group {
  id: number;
  name: string;
  deletedAt: Date;

  constructor(partial: GroupPrisma) {
    Object.assign(this, partial);
  }
}
