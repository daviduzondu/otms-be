import { IsUUID } from 'class-validator';

export class SubmitAnswerQuestionDTO {
  @IsUUID()
  testId: string;

  @IsUUID()
  questionId: string;
}
