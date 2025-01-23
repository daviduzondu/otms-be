import { Exclude } from 'class-transformer';
import { IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';
import { Platform } from 'src/modules/kysesly/kysesly-types/enums';

export class CreateTestDto {
  @IsOptional()
  @IsNumber()
  printCount: number;

  @IsString()
  @Matches(/^[a-zA-Z0-9\s.,!?()\[\]-]*$/, {
    message: 'Title can only contain letters, numbers, spaces, and common punctuation (.,!?()[]-)',
  })
  title: string;
  //
  // @IsDateString()
  // startsAt: string;
  //
  // @IsDateString()
  // endsAt: string;

  @IsEnum(Platform)
  platform: Platform;

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
  randomizeQuestions: boolean;

  @Exclude()
  createdAt: string;

  @Exclude()
  updatedAt: string;
}
