import { IsOptional, IsString } from 'class-validator';

export default class BrandingDto {
  @IsString()
  field1: string;

  @IsString()
  @IsOptional()
  field2: string;

  @IsString()
  @IsOptional()
  field3: string;
}