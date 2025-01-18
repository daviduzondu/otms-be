import { Exclude } from 'class-transformer';
import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateTestDto {
  @IsOptional()
  @IsNumber()
  printCount: number;

  @IsString()
  @Matches(/^[a-zA-Z0-9 ]*$/, {
    message: 'Title can only contain letters, numbers, and spaces',
  })
  title: string;
  //
  // @IsDateString()
  // startsAt: string;
  //
  // @IsDateString()
  // endsAt: string;

  @IsOptional()
  @IsString()
  instructions: string;

  @IsBoolean()
  requireFullScreen: boolean;

  @IsBoolean()
  showResultsAfterTest: boolean;

  @IsBoolean()
  disableCopyPaste: boolean;

  @IsNumber()
  @Min(30)
  @Max(180)
  durationMin: number;

  @IsBoolean()
  provideExplanations: boolean;

  @IsBoolean()
  randomizeQuestions: boolean;

  @Exclude()
  createdAt: string;

  @Exclude()
  updatedAt: string;
}
