import { ApiPropertyOptional } from '@nestjs/swagger';
import { EducationLevel, MaterialKind, Subject } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

const upper = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.toUpperCase() : value;

const toBool = ({ value }: { value: unknown }) => {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return value;
};

export class MaterialFilterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: Subject })
  @IsOptional()
  @Transform(upper)
  @IsEnum(Subject)
  subject?: Subject;

  @ApiPropertyOptional({ enum: EducationLevel })
  @IsOptional()
  @Transform(upper)
  @IsEnum(EducationLevel)
  level?: EducationLevel;

  @ApiPropertyOptional({ enum: MaterialKind })
  @IsOptional()
  @Transform(upper)
  @IsEnum(MaterialKind)
  kind?: MaterialKind;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  isPremium?: boolean;
}
