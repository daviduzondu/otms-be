import { IsString } from 'class-validator';

export default class BrandingDto {
  @IsString()
  field1: string;

  @IsString()
  field2: string;

  @IsString()
  field3: string;
}