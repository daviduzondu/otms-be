import { ArrayNotEmpty, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OmitType } from '@nestjs/mapped-types';

class AddInfo {
  @IsUUID()
  studentId: string;

  @IsUUID()
  origin: string;

  @IsUUID()
  testId: string;
}

class RemoveInfo extends OmitType(AddInfo, ['origin']) {}

export class AddParticipantDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AddInfo)
  students: AddInfo[];
}

export class RemoveParticipantDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RemoveInfo)
  students: AddInfo[];
}
