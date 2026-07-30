import { IsString, IsEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsEmpty()
  name!: string;

  @IsString()
  @IsEmpty()
  role!: string;
}
