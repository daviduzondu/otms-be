import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { Database } from '../kysesly/database';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionOrderDto } from './dto/update-question-index.dto';
import { CustomException } from 'src/exceptions/custom.exception';
import { jsonObjectFrom } from 'kysely/helpers/postgres';

@Injectable()
export class QuestionsService {
  constructor(@InjectKysesly() private db: Database) {}

  async createQuestion(payload: CreateQuestionDto) {
    // this.testService.getTestRecordByUser(payload.testId, req).catch(() => {
    //   throw new CustomException(
    //     'Access denied. You either do not have permission to modify this test or the test does not exist.',
    //     HttpStatus.NOT_FOUND,
    //   );
    // });
    const existingAttempt = await this.db.selectFrom('test_attempts').selectAll().where('testId', '=', payload.testId).executeTakeFirst();
    if (existingAttempt) {
      throw new CustomException('You cannot add a new question because one or more students have attempted this test', HttpStatus.CONFLICT);
    }

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
          index: Number(totalQuestions) > 0 ? Number(totalQuestions) : 0,
        }),
      )
      .returningAll()
      .returning((eb) => [jsonObjectFrom(eb.selectFrom('media').whereRef('media.id', '=', 'mediaId').select(['id', 'url', 'type'])).as('media')])
      .executeTakeFirst();

    // await this.db.updateTable('tests').set('updatedAt', question.updatedAt).where('tests.id', '=', question.testId).execute()

    return {
      message: 'Question added to test successfully',
      data: question,
    };
  }

  async editQuestion(payload: CreateQuestionDto, questionId: string) {
    const existingAttempt = await this.db.selectFrom('test_attempts').selectAll().where('testId', '=', payload.testId).executeTakeFirst();
    if (existingAttempt) {
      throw new CustomException('You cannot edit this question because one or more students have attempted this test', HttpStatus.CONFLICT);
    }

    const question = await this.db
      .updateTable('questions')
      .set(payload as any)
      .where('id', '=', questionId)
      .returningAll()
      .returning((eb) => [jsonObjectFrom(eb.selectFrom('media').whereRef('media.id', '=', 'mediaId').select(['id', 'url', 'type'])).as('media')])
      .executeTakeFirst();

    // await this.db.updateTable('tests').set('updatedAt', question.updatedAt).where('tests.id', '=', question.testId).execute()

    return {
      message: 'Question edited successfully',
      data: question,
    };
  }

  async deleteQuestion(questionId: string) {
    const existingAttempt = await this.db
      .selectFrom('test_attempts')
      .innerJoin('questions', 'questions.testId', 'test_attempts.testId')
      .selectAll()
      .where('questions.id', '=', questionId) // Match the questionId
      .executeTakeFirst();

    if (existingAttempt) {
      throw new CustomException('You cannot delete this question because one or more students have attempted this test', HttpStatus.CONFLICT);
    }

    await this.db.updateTable('questions').set({ isDeleted: true }).where('id', '=', questionId).execute();

    return {
      message: 'Question deleted successfully',
    };
  }

  async updateQuestionOrder(updateQuestionsDto: UpdateQuestionOrderDto) {
    const existingAttempt = await this.db.selectFrom('test_attempts').selectAll().where('testId', '=', updateQuestionsDto.questions[0].testId).executeTakeFirst();
    if (existingAttempt) {
      throw new CustomException('You cannot make any changes because one or more students have attempted this test', HttpStatus.CONFLICT);
    }

    const { questions } = updateQuestionsDto;
    // Loop through the questions array and update each question's index
    for (const question of questions) {
      const { id, index, testId } = question;

      await this.db.updateTable('questions').set({ index }).where('testId', '=', testId).where('id', '=', id).execute();
    }

    return {
      message: 'Update applied to all questions',
    };
  }

  async removeMedia(questionId: string, mediaId: string, testId: string) {
    const existingAttempt = await this.db.selectFrom('test_attempts').selectAll().where('testId', '=', testId).executeTakeFirst();
    if (existingAttempt) {
      throw new CustomException('You cannot make any changes because one or more students have attempted this test', HttpStatus.CONFLICT);
    }

    await this.db.updateTable('questions').set('mediaId', null).where('id', '=', questionId).where('mediaId', '=', mediaId).execute();

    return {
      message: 'Media removed successfully',
    };
  }
}
