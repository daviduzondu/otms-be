import { ArrayNotEmpty, IsArray, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateClassDto {
  @IsString()
  name: string;

  @IsArray({ message: 'Options must be an array for MCQ questions' })
  @ArrayNotEmpty({ message: 'Options cannot be empty for MCQ questions' })
  @IsOptional()
  students: string[];
}
