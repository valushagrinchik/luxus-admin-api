import { Uploads as UploadPrisma } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class Upload implements UploadPrisma {
  id: number;
  name: string;

  @Exclude()
  mimetype: string;
  @Exclude()
  size: number;
  @Exclude()
  path: string;

  constructor(partial: UploadPrisma) {
    Object.assign(this, partial);
  }
}
