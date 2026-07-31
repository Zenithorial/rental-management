import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class AddUnitDto {
  @IsString()
  @IsNotEmpty()
  unitNumber!: string;

  @IsNumber()
  @IsNotEmpty()
  propertyId!: number;

  @IsNumber()
  @IsNotEmpty()
  monthlyRent!: number;

  @IsString()
  @IsNotEmpty()
  status!: string;
}
