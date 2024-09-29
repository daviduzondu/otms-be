import { Injectable } from '@nestjs/common';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { Database } from '../kysesly/database';
import { CreateQuestionDto } from './dto/create-question.dto';
import { TestService } from '../test-mgmt/tests.service';
import { UpdateQuestionIndexDto } from './dto/update-question-index.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectKysesly() private db: Database,
    private testService: TestService,
  ) {}

  async createQuestion(payload: CreateQuestionDto) {
    // this.testService.getTestRecordByUser(payload.testId, req).catch(() => {
    //   throw new CustomException(
    //     'Access denied. You either do not have permission to modify this test or the test does not exist.',
    //     HttpStatus.NOT_FOUND,
    //   );
    // });

    const question = await this.db
      .insertInto('questions')
      .values(payload as any)
      .returningAll()
      .execute();

    return {
      message: 'Question added to test successfully',
      data: question,
    };
  }

  async editQuestion(payload: CreateQuestionDto, questionId: string) {
    const question = await this.db
      .updateTable('questions')
      .set(payload as any)
      .where('id', '=', questionId)
      .returningAll()
      .execute();

    return {
      message: 'Question edited successfully',
      data: question,
    };
  }

  async deleteQuestion(questionId: string) {
    await this.db
      .updateTable('questions')
      .set({ isDeleted: true })
      .where('id', '=', questionId)
      .execute();

    return {
      message: 'Question deleted successfully',
    };
  }

  async updateQuestionIndex({
    destinationIndex,
    destinationId,
    sourceIndex,
    sourceId,
  }: UpdateQuestionIndexDto) {
    // Update the destination question index
    await this.db
      .updateTable('questions')
      .set({ index: destinationIndex })
      .where('id', '=', destinationId)
      .execute();

    // Update the source question index
    await this.db
      .updateTable('questions')
      .set({ index: sourceIndex })
      .where('id', '=', sourceId)
      .execute();

    return {
      message: 'Update applied',
    };
  }
}
