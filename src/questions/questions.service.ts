import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { Database } from '../kysesly/database';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Request } from 'express';
import { CustomException } from '../exceptions/custom.exception';

@Injectable()
export class QuestionsService {
  constructor(@InjectKysesly() private db: Database) {}

  async createQuestion(payload: CreateQuestionDto, req: Request) {
    await this.db
      .selectFrom('tests')
      .selectAll()
      .where('id', '=', payload.testId)
      .where('tests.creatorId', '=', (req as any).user.id)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException(
          'Access denied. You either do not have permission to modify this test or the test does not exist.',
          HttpStatus.NOT_FOUND,
        );
      });

    const question = await this.db
      .insertInto('questions')
      .values(Object.assign(payload, { correctAnswer: undefined }))
      .returningAll()
      .execute();

    return {
      message: 'Question added to test successfully',
      data: question,
    };
  }
}
