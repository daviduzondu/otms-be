import { ArrayMinSize, ArrayNotEmpty, IsArray, IsString, IsUUID } from 'class-validator';

export class SendTestInvitationMailDto {
  @IsUUID()
  testId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true }) // '4' specifies UUID version, and `each: true` applies validation to each item
  students: string[];
}
