import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsObject,
  IsEnum,
  IsUrl,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Subject, EducationLevel, TeachingMethod } from '@prisma/client';

// Accepts +62..., 62..., 08... Indonesian formats with optional separators.
const WA_REGEX = /^[0-9+\-\s]{8,20}$/;

export class CreateTutorDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber({}, { message: 'experience must be a number' })
  @Type(() => Number)
  experience?: number;

  @IsNumber({}, { message: 'hourlyRate must be a number' })
  @Type(() => Number)
  hourlyRate: number;

  @IsArray()
  @IsEnum(Subject, { each: true })
  subjects: Subject[];

  @IsOptional()
  @IsString()
  @Matches(WA_REGEX, { message: 'whatsappNumber must be E.164 format' })
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  educationBackground?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(EducationLevel, { each: true })
  educationLevels?: EducationLevel[];

  @IsOptional()
  @IsArray()
  @IsEnum(TeachingMethod, { each: true })
  teachingMethods?: TeachingMethod[];

  @IsOptional()
  @IsUrl()
  introVideoUrl?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  bankAccountHolder?: string;
}
