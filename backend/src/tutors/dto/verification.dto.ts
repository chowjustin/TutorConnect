import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { VerificationStatus } from '@prisma/client';

export class SubmitVerificationDto {
  @IsNotEmpty()
  @IsUrl()
  idDocumentUrl: string;

  @IsNotEmpty()
  @IsUrl()
  educationProofUrl: string;
}

export class ReviewVerificationDto {
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
