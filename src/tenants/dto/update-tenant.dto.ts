import { IsString, IsEmail, IsNumber, IsOptional } from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsOptional()
  unitId?: number;
}
