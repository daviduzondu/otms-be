import { IsNumber, IsUUID } from 'class-validator';

export class UpdateQuestionIndexDto {
  @IsUUID()
  sourceId: string;

  @IsNumber()
  sourceIndex: number;

  @IsUUID()
  destinationId: string;

  @IsNumber()
  destinationIndex: number;
}
