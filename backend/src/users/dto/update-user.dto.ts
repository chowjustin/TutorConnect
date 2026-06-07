import { IsOptional, IsString, MinLength } from 'class-validator';

// email and role intentionally omitted — email change goes through a
// dedicated verified flow; role is administrative-only.
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
