import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateUnitDto {
  @IsString()
  @IsOptional()
  unitNumber?: string;

  @IsNumber()
  @IsOptional()
  monthlyRent?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
