import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class AddPropertyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsNumber()
  @IsNotEmpty()
  ownerId!: number;
}
