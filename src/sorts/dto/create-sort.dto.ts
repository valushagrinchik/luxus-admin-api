import { IsNotEmpty } from 'class-validator';

export class CreateSortDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  categoryId: number;
}
