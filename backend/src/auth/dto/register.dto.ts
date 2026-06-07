import { IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, Matches, ValidateIf } from 'class-validator';
import { UserRole } from '@prisma/client';

const WA_REGEX = /^\+?[1-9]\d{7,14}$/;

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  // Required for TUTOR, optional for STUDENT
  @ValidateIf((o) => o.role === UserRole.TUTOR)
  @IsNotEmpty({ message: 'whatsappNumber is required for tutors' })
  @IsString()
  @Matches(WA_REGEX, { message: 'whatsappNumber must be E.164 format' })
  @ValidateIf((o, v) => v !== undefined && v !== null && v !== '')
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  referralCode?: string;
}
