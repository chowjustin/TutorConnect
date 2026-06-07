import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class InviteAdminDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}
