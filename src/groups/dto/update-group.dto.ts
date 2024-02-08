import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupDto } from './create-group.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  @IsNotEmpty()
  id: string;
}
