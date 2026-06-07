import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  tutorId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;
}
