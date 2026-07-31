import { IsString, IsNotEmpty, IsEmail, IsNumber } from 'class-validator';

export class AddTenantDto {
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNumber()
  @IsNotEmpty()
  unitId!: number;
}
