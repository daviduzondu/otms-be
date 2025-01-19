import { ArrayMinSize, ArrayNotEmpty, IsArray, IsEmail, IsString, IsUUID } from 'class-validator';

export class SendTestInvitationMailDto {
  @IsUUID()
  testId: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  students: string[];
}

export class SendTestTokenDto {
  @IsEmail()
  email: string;

  @IsString()
  code: string;
}

export class SendTestResults extends SendTestInvitationMailDto {}