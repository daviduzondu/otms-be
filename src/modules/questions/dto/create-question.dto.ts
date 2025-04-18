import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Validate, ValidateIf } from 'class-validator';
import { QuestionType } from '../../kysesly/kysesly-types/enums';
import { CustomIsInArray } from '../../../validators/options-validator';

export class CreateQuestionDto {
  @IsUUID()
  testId: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsNumber({ allowNaN: false })
  points: string;

  @ValidateIf((o) => o.type === QuestionType.mcq)
  @IsArray({ message: 'Options must be an array for MCQ questions' })
  @ArrayNotEmpty({ message: 'Options cannot be empty for MCQ questions' })
  @IsOptional()
  options: string[];

  @ValidateIf((o) => o.type === QuestionType.mcq)
  @Validate(CustomIsInArray, ['options'], {
    message: 'Correct answer must be one of the options',
  })
  @IsString({ message: 'Correct answer must be a string' })
  @IsOptional()
  correctAnswer: string;

  @IsUUID()
  @IsOptional()
  mediaId: string;

  @IsNumber()
  @IsOptional()
  timeLimit: string;
}
