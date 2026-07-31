import {
  IsString,
  IsEmail,
  IsOptional,
  IsStrongPassword,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsStrongPassword()
  @IsString()
  @IsOptional()
  password?: string;
}
