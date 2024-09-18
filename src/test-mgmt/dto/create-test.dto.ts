import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateTestDto {
  @IsOptional()
  @IsNumber()
  printCount: number;

  @IsString()
  @Matches(/^[a-zA-Z0-9 ]*$/, {
    message: 'Title can only contain letters, numbers, and spaces',
  })
  title: string;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsOptional()
  @IsString()
  instructions: string;

  @IsNumber()
  passingScore: number;

  @IsBoolean()
  requireFullScreen: boolean;

  @IsBoolean()
  showCorrectAnswers: boolean;

  @IsBoolean()
  disableCopyPaste: boolean;

  @IsBoolean()
  provideExplanations: boolean;

  @IsBoolean()
  randomizeQuestions: boolean;
}
