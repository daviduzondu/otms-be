import { IsNumber, IsUUID } from 'class-validator';

export class UpdateScoreDto {
  @IsUUID()
  studentId: string;
  @IsUUID()
  questionId: string;
  @IsNumber()
  point: number;
}