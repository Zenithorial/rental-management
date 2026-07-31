import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdatePropertyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;
}
