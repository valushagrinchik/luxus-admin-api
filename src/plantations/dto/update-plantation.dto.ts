import {
  Contact,
  LegalEntity,
  PlantationChecks,
  TransferDetails,
} from './create-plantation.dto';

export class UpdateTransferDetails extends TransferDetails {
  id: string;
}
export class UpdatePlantationChecks extends PlantationChecks {
  id: string;
}
export class UpdateLegalEntity extends LegalEntity {
  id: string;
  checks: UpdatePlantationChecks[];
  transferDetails: UpdateTransferDetails[];
}
export class UpdateContact extends Contact {
  id: string;
}
export class UpdatePlantationDto {
  id: string;
  contacts: UpdateContact[];
  legalEntities: UpdateLegalEntity[];

  name: string;
  country: string;
  comments: string;

  deliveryMethod: string;
  termsOfPayment: string;

  postpaidCredit: string;
  postpaidDays: string;
}
