import { IsArray, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Info {
  @IsUUID()
  studentId: string;

  @IsUUID()
  origin: string;

  @IsUUID()
  testId: string;
}

export class AddParticipantDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Info)
  students: Info[];
}
