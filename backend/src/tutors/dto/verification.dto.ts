import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VerificationStatus } from '@prisma/client';

export class SubmitVerificationDto {
  @IsNotEmpty()
  @IsString()
  idDocumentUrl: string;

  @IsNotEmpty()
  @IsString()
  educationProofUrl: string;
}

export class ReviewVerificationDto {
  @IsEnum(VerificationStatus)
  status: VerificationStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
