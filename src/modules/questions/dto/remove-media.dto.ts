import { IsUUID } from 'class-validator';

export class RemoveMediaDto {
  @IsUUID()
  mediaId: string;

  @IsUUID()
  testId: string;
}