import {
  IsString,
  IsEmail,
  IsOptional,
  IsStrongPassword,
} from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsStrongPassword()
  @IsString()
  @IsOptional()
  password?: string;
}
