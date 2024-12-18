import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { Database } from '../kysesly/database';
import { CreateTestDto } from './dto/create-test.dto';
import { Request } from 'express';
import { tests } from '../kysesly/kysesly-types/kysesly';
import { CustomException } from '../../exceptions/custom.exception';
import { EmailService } from '../email/email.service';
import { SendTestInvitationMailDto } from './dto/send-test.dto';
import path from 'node:path';
import { ConfigService } from '@nestjs/config';
import { AddParticipantDto, RemoveParticipantDto } from './dto/participant.dto';
import { customAlphabet } from 'nanoid';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { addMinutes, isWithinInterval } from 'date-fns';
import { QuestionType } from '../kysesly/kysesly-types/enums';
import _ from 'lodash';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const { customAlphabet } = require('fix-esm').require('nanoid');

@Injectable()
export class TestService {
  constructor(
    @InjectKysesly() private db: Database,
    private readonly emailService: EmailService,
  ) {}

  private async generateTestCode() {
    return customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 21)(7);
  }

  private generateAccessCode() {
    return customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)();
  }

  // async getTestRecordByUser(testId: string, req: any) {
  //   return await this.db
  //     .selectFrom('tests')
  //     .selectAll()
  //     .where('id', '=', testId)
  //     .where('tests.teacherId', '=', (req as any).teacher.id)
  //     .executeTakeFirstOrThrow();
  // }

  async createNewTest(payload: CreateTestDto, req: Request) {
    Object.assign(payload, {
      code: await this.generateTestCode(),
      teacherId: (req as any).user.id,
    } as tests);

    const test = await this.db.insertInto('tests').values(payload).returningAll().executeTakeFirst();

    return {
      message: 'Test Creation Sucessful',
      data: test,
    };
  }

  async addParticipant(addParticipantDto: AddParticipantDto) {
    // Check if the student exists
    let students = await this.db
      .selectFrom('students')
      .leftJoin('student_tokens', 'student_tokens.studentId', 'students.id')
      .select(['students.id as studentId', 'student_tokens.accessCode as accessCode', 'student_tokens.testId as testId'])
      .where(
        'students.id',
        'in',
        addParticipantDto.students.map((x) => x.studentId),
      )
      .execute();

    if (students.length === 0) throw new CustomException('One or more students in the list do not exist', HttpStatus.NOT_FOUND);

    // Generate access code for students without them
    const data = addParticipantDto.students.map((student) => {
      const existingStudentWithToken = students.find((x) => x.accessCode && x.studentId === student.studentId && x.testId === student.testId);

      if (!existingStudentWithToken) {
        return { ...student, origin: undefined, accessCode: this.generateAccessCode() };
      } else {
        return { ...student, origin: undefined, accessCode: existingStudentWithToken.accessCode };
      }
    });

    // Add the student to the participants
    const result = await this.db
      .insertInto('test_participants')
      .values(addParticipantDto.students)
      .returning(['studentId as id', 'testId'])
      .onConflict((oc) => oc.columns(['testId', 'studentId']).doNothing())
      .executeTakeFirst();

    // Generate access token for that student
    await this.db
      .insertInto('student_tokens')
      .values(data)
      .onConflict((oc) => oc.columns(['testId', 'studentId', 'accessCode']).doNothing())
      .execute();

    return {
      message: 'Student successfully added to participants',
      data: result,
    };
  }

  async removeParticipant(removeParticipantDto: RemoveParticipantDto) {
    await this.db.transaction().execute(async (trx) => {
      // First delete query within the transaction
      await trx
        .deleteFrom('test_participants')
        .where(
          'test_participants.studentId',
          'in',
          removeParticipantDto.students.map((x) => x.studentId),
        )
        .where(
          'test_participants.testId',
          'in',
          removeParticipantDto.students.map((x) => x.testId),
        )
        .execute();

      // Second delete query within the transaction
      await trx
        .deleteFrom('student_tokens')
        .where(
          'student_tokens.studentId',
          'in',
          removeParticipantDto.students.map((x) => x.studentId),
        )
        .where(
          'student_tokens.testId',
          'in',
          removeParticipantDto.students.map((x) => x.testId),
        )
        .execute();

      // Return the result of the transaction if needed
      return { success: true };
    });

    return {
      message: 'Successfully removed student',
    };
  }

  async getAllTests(req: Request) {
    await new Promise((res) => setTimeout(() => res(null), 1200));
    const tests = await this.db
      .selectFrom('tests')
      .selectAll('tests')
      .where('teacherId', '=', (req.user as any).id)
      .execute();

    return {
      message: 'Tests retrieved successfully',
      data: tests,
    };
  }

  async getTest(id: string, req: Request) {
    const test = await this.db
      .selectFrom('tests')
      .selectAll('tests') // Select all fields from 'tests'
      .where('tests.id', '=', id)
      .where('tests.teacherId', '=', (req as any).user.id)
      .executeTakeFirstOrThrow(() => {
        return new CustomException('Test not found', HttpStatus.NOT_FOUND);
      });

    const questions = await this.db
      .selectFrom('questions')
      .selectAll('questions') // Select all fields from 'questions'
      .where('testId', '=', id)
      .where((eb) => {
        return eb('isDeleted', '=', false).or('isDeleted', '=', null);
      })
      .orderBy('index asc')
      .execute();

    return {
      message: 'Test retrieved successfully',
      data: {
        ...test,
        questions, // Include the array of questions in the response
      },
    };
  }

  async fetchQuestion(testId: string, questionId: string, studentId: string) {
    const data = await this.db.transaction().execute(async (trx) => {
      const question = await trx
        .selectFrom('questions')
        .where('questions.id', '=', questionId)
        .where('testId', '=', testId)
        .select(['body', 'mediaId', 'options', 'points', 'timeLimit'])
        .executeTakeFirstOrThrow(() => {
          throw new CustomException('Question not found!');
        });

      await trx
        .insertInto('student_grading')
        .values({
          startedAt: new Date(),
          studentId,
          testId,
          questionId,
        })
        .onConflict((oc) => oc.columns(['questionId', 'testId', 'studentId', 'startedAt']).doNothing())
        .execute();

      return question;
    });

    return {
      message: 'Question retrieved successfully',
      data,
    };
  }

  async submitAnswer(testId: string, studentId: string, questionId: string, answer: string) {
    // Retrieve the test
    const test = await this.db
      .selectFrom('test_attempts')
      .leftJoin('tests', 'tests.id', 'test_attempts.testId')
      .selectAll()
      .where('test_attempts.testId', '=', testId)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Attempt not found', HttpStatus.NOT_FOUND);
      });

    // Retrieve question
    const question = await this.db
      .selectFrom('questions')
      .selectAll()
      .where('questions.id', '=', questionId)
      .where('testId', '=', testId)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Question not found', HttpStatus.NOT_FOUND);
      });

    // Retrieve start time for timed questions
    let submission = await this.db.selectFrom('student_grading').selectAll().where('questionId', '=', questionId).where('testId', '=', testId).executeTakeFirst();

    if (!submission?.startedAt) throw new CustomException('One or more parameters are missing', HttpStatus.BAD_REQUEST);

    const payload = {
      startedAt: submission?.startedAt,
      isWithinTime: submission && question.timeLimit ? this.isWithinTime(submission.startedAt, question.timeLimit + 2) && this.isWithinTime(addMinutes(test.startedAt, test.durationMin), question.timeLimit + 2) : this.isWithinTime(addMinutes(test.startedAt, 2), test.durationMin),
      isTouched: true,
      isCorrect: (<QuestionType[]>['mcq', 'trueOrFalse']).includes(question.type) ? String(answer) === question.correctAnswer : undefined,
      point: (<QuestionType[]>['mcq', 'trueOrFalse']).includes(question.type) && String(answer) === question?.correctAnswer ? question.points : undefined,
    };

    // Make a submission
    const result = await this.db
      .insertInto('student_grading')
      .values({
        testId,
        questionId,
        answer,
        studentId,
        ...payload,
      })
      .onConflict((oc) =>
        oc.columns(['testId', 'startedAt', 'questionId', 'studentId']).doUpdateSet({
          ...Object.assign(payload, {
            isCorrect: payload.isWithinTime ? true : submission.isCorrect,
            point: payload.isWithinTime ? payload.point : submission.point,
          }),
        }),
      )
      .returningAll()
      .execute();

    return {
      message: payload.isWithinTime ? 'Answer submitted successfully' : 'Submitted, but late submission.',
      result,
    };
  }

  async submitTest() {}

  async takeTest(accessCode: string) {
    // Identify the student based on the access token
    const { studentId, testId } = await this.db
      .selectFrom('student_tokens')
      .leftJoin('students', 'students.id', 'student_tokens.studentId')
      .where('accessCode', '=', accessCode)
      .selectAll()
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Failed to retrieve details. Is the access token correct?', HttpStatus.NOT_FOUND);
      });

    // Retrieve the test associated with that access code.
    const test = await this.db
      .selectFrom('tests')
      .select(({ eb }) => [
        'title',
        'instructions',
        'teacherId',
        'passingScore',
        'durationMin',
        'id',
        'randomizeQuestions',
        jsonArrayFrom(
          eb
            .selectFrom('questions')
            .where('questions.testId', '=', testId)
            .where((eb) => eb('isDeleted', '=', false).or('isDeleted', '=', null))
            .selectAll(),
        ).as('questions'),
      ])
      .where('tests.id', '=', testId)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Test not found', HttpStatus.FOUND);
      });

    // Now push the data to the attempts table
    const existingAttempt = await this.db.selectFrom('test_attempts').where('studentId', '=', studentId).where('testId', '=', testId).selectAll().executeTakeFirst();
    const startedAt = existingAttempt?.startedAt || new Date();
    const endsAt = new Date(startedAt.getTime() + (test.durationMin + 5) * 60 * 1000);
    let questions = (() => (test.randomizeQuestions ? _.shuffle(test.questions) : test.questions))();

    if (existingAttempt) {
      questions = existingAttempt.questions;
    } else {
      await this.db
        .insertInto('test_attempts')
        .values({
          testId,
          questions: questions.map((q) => q.id),
          studentId,
          startedAt,
          endsAt,
        })
        .onConflict((oc) => oc.columns(['testId', 'studentId']).doNothing())
        .execute();
    }

    return {
      message: 'Test retrieved successfully',
      data: {
        ...test,
        randomizeQuestions: undefined,
        questions: undefined,
        question: questions,
        startedAt,
      },
    };
  }

  async sendTestInvitationMail(req, { students, testId }: SendTestInvitationMailDto) {
    // Get the test
    const test = await this.db
      .selectFrom('tests')
      .selectAll()
      .where('tests.id', '=', testId)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Test not found!', HttpStatus.NOT_FOUND);
      });

    // Get the students
    const results = await this.db.selectFrom('students').leftJoin('student_tokens', 'student_tokens.studentId', 'students.id').selectAll().where('students.id', 'in', students).where('testId', '=', testId).execute();
    if (results.length === 0) {
      throw new CustomException('Some students in this list do not exist', HttpStatus.NOT_FOUND);
    }

    // Get the teacher
    const teacher = await this.db
      .selectFrom('teachers')
      .selectAll()
      .where('id', '=', (req as any).user.id)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Teacher not found!', HttpStatus.NOT_FOUND);
      });

    console.log(students, results);

    await this.emailService.sendEmail({
      to: results.map((x) => ({ email: x.email, name: `${x.firstName} ${x.lastName}` })),
      subject: 'You have been invited to take a test!',
      templateName: 'test-invitation',
      context: results.map((x) => ({
        testUrl: new URL(path.join(new ConfigService().get('FRONTEND_BASE_URL'), 't', `${test.code}?token=${x.accessCode}`)),
        studentName: `${x.firstName} ${x.lastName}`,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        testName: test.title,
        fallbackUrl: new URL(path.join(new ConfigService().get('FRONTEND_BASE_URL'), 't', `${test.code}?token=${x.accessCode}`)),
        email: x.email,
      })),
    });

    return {
      message: 'Mail sent to all receipients',
    };
  }

  private isWithinTime(startedAt: Date, timeLimit: number) {
    const now = new Date();
    const endTime = addMinutes(startedAt, timeLimit);
    return isWithinInterval(now, { start: startedAt, end: endTime });
  }
}
