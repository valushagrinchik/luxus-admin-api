import { PlantationChecks as PlantationChecksPrisma } from '@prisma/client';
import { Exclude, Transform } from 'class-transformer';
import { Upload } from 'src/uploads/entities/Upload.entity';

export class PlantationChecks implements PlantationChecksPrisma {
  id: number;
  name: string;
  beneficiary: string;
  favourite: boolean;
  @Exclude()
  plantationId: number;
  plantationLegalEntityId: number;
  documentId: number | null;

  @Transform(({ value }) => {
    return value ? new Upload(value) : null;
  })
  document: Upload;

  constructor(partial: PlantationChecksPrisma) {
    Object.assign(this, partial);
  }
}
