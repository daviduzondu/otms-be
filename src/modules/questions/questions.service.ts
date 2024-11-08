import { Injectable } from '@nestjs/common';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { Database } from '../kysesly/database';
import { CreateQuestionDto } from './dto/create-question.dto';
import { TestService } from '../test-mgmt/tests.service';
import { UpdateQuestionOrderDto } from './dto/update-question-index.dto';

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
    const { totalQuestions } = await this.db
      .selectFrom('questions')
      .where('testId', '=', payload.testId)
      .where('isDeleted', '=', false)
      .select(({ fn }) => fn.count('id').as('totalQuestions'))
      .executeTakeFirst();

    const question = await this.db
      .insertInto('questions')
      .values(
        Object.assign(payload as any, {
          index: Number(totalQuestions) > 0 ? Number(totalQuestions) + 1 : 0,
        }),
      )
      .returningAll()
      .executeTakeFirst();

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

  async updateQuestionOrder(updateQuestionsDto: UpdateQuestionOrderDto) {
    const { questions } = updateQuestionsDto;
    // Loop through the questions array and update each question's index
    for (const question of questions) {
      const { id, index, testId } = question;

      await this.db
        .updateTable('questions')
        .set({ index })
        .where('testId', '=', testId)
        .where('id', '=', id)
        .execute();
    }

    return {
      message: 'Update applied to all questions',
    };
  }
}
