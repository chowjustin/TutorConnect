import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  Matches,
} from 'class-validator';
import { Subject } from '@prisma/client';

const WA_REGEX = /^[0-9+\-\s]{8,20}$/;

export class CreateStudentDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Subject, { each: true })
  interests?: Subject[];

  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  @Matches(WA_REGEX, { message: 'whatsappNumber must be E.164 format' })
  whatsappNumber?: string;
}
