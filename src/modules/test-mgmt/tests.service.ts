import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { Database } from '../kysesly/database';
import { CreateTestDto, EditTestDto } from './dto/test.dto';
import { Request } from 'express';
import { tests } from '../kysesly/kysesly-types/kysesly';
import { CustomException } from '../../exceptions/custom.exception';
import { EmailService } from '../email/email.service';
import { SendTestInvitationMailDto, SendTestResults, SendTestTokenDto } from './dto/mail-test.dto';
import { ConfigService } from '@nestjs/config';
import { AddParticipantDto, RemoveParticipantDto } from './dto/participant.dto';
import { customAlphabet } from 'nanoid';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { addMinutes, isWithinInterval } from 'date-fns';
import { QuestionType } from '../kysesly/kysesly-types/enums';
import _ from 'lodash';
import { sql } from 'kysely';
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

  async revokeTest(testId: string, revoked: boolean) {
    await this.db.updateTable('tests').set('isRevoked', revoked).where('tests.id', '=', testId).execute();
    return {
      message: 'Updated test status',
    };
  }

  async createNewTest(payload: CreateTestDto, req: Request) {
    Object.assign(payload, {
      code: await this.generateTestCode(),
      teacherId: (req as any).user.id,
    } as tests);

    const test = await this.db.insertInto('tests').values(payload).returningAll().executeTakeFirst();

    return {
      message: 'Test Creation Successful',
      data: test,
    };
  }

  async editTest(payload: EditTestDto, req: Request) {
    const existingAttempt = await this.db.selectFrom('test_attempts').selectAll().where('testId', '=', payload.testId).executeTakeFirst();
    if (existingAttempt) {
      throw new CustomException('You cannot edit this question because one or more students have attempted this test', HttpStatus.CONFLICT);
    }

    const testId = payload.testId;
    Object.assign(payload, {
      teacherId: (req as any).user.id,
    } as tests);

    delete payload.testId;

    // console.log(Object.assign(payload, {testId: null}));

    const test = await this.db.updateTable('tests').set(payload).where('id', '=', testId).returningAll().executeTakeFirst();
    return {
      message: 'Test edited successfully',
      data: test,
    };
  }

  async addParticipant(addParticipantDto: AddParticipantDto) {
    // Check if the student exists
    const students = await this.db
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
      const existingAttempt = await trx
        .selectFrom('test_attempts')
        .leftJoin('students', 'test_attempts.studentId', 'students.id')
        .selectAll()
        .where(
          'test_attempts.studentId',
          'in',
          removeParticipantDto.students.map((x) => x.studentId),
        )
        .where(
          'test_attempts.testId',
          'in',
          removeParticipantDto.students.map((x) => x.testId),
        )
        .execute();

      const message = `You cannot remove ${existingAttempt
        .map((s, index) => {
          const isLast = index === existingAttempt.length - 1;
          const isSecondLast = index === existingAttempt.length - 2;
          const separator = isLast ? '' : isSecondLast ? ' and ' : ', ';
          return `${s.firstName} ${s.lastName}${separator}`;
        })
        .join('')} from this test. Because they have already taken it.`;

      if (existingAttempt.length > 0) throw new CustomException(message, HttpStatus.CONFLICT);

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

      await trx
        .deleteFrom('student_grading')
        .where(
          'student_grading.studentId',
          'in',
          removeParticipantDto.students.map((x) => x.studentId),
        )
        .where(
          'student_grading.testId',
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
    const tests = await this.db
      .selectFrom('tests')
      .leftJoin('test_participants', 'test_participants.testId', 'tests.id')
      .selectAll('tests')
      .select((eb) => [eb.fn.count('test_participants.id').as('participantCount')])
      .groupBy('tests.id')
      .where('teacherId', '=', (req.user as any).id)
      .where('tests.isDeleted', '=', false)
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
      .where('tests.isDeleted', '=', false)
      .executeTakeFirstOrThrow(() => {
        return new CustomException('Test not found', HttpStatus.NOT_FOUND);
      });

    const questions = await this.db
      .selectFrom('questions')
      .selectAll('questions') // Select all fields from 'questions'
      .select((eb) => [jsonObjectFrom(eb.selectFrom('media').whereRef('media.id', '=', 'mediaId').select(['id', 'url', 'type'])).as('media')])
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
    await this.db
      .selectFrom('test_attempts')
      .where('test_attempts.testId', '=', testId)
      .where('test_attempts.studentId', '=', studentId)
      .where('test_attempts.endsAt', '>', new Date())
      .executeTakeFirstOrThrow(() => {
        throw new CustomException("You've already made a submission", HttpStatus.METHOD_NOT_ALLOWED);
      });

    const data = await this.db.transaction().execute(async (trx) => {
      const question = await trx
        .selectFrom('questions')
        .where('questions.id', '=', questionId)
        .where((eb) => eb('isDeleted', '=', false).or('isDeleted', '=', null))
        .where('testId', '=', testId)
        .select((eb) => [jsonObjectFrom(eb.selectFrom('media').whereRef('media.id', '=', 'mediaId').select(['id', 'url', 'type'])).as('media'), 'body', 'mediaId', 'options', 'points', 'timeLimit', 'type', 'id'])
        .executeTakeFirstOrThrow(() => {
          throw new CustomException(`Question with id ${questionId} for test ${testId} not found!`);
        });

      await trx.updateTable('test_attempts').set({ currentQuestionId: questionId }).where('test_attempts.studentId', '=', studentId).where('test_attempts.testId', '=', testId).executeTakeFirst();

      const startAt = new Date();
      const { startedAt } = await trx
        .insertInto('student_grading')
        .values({
          startedAt: startAt,
          isTouched: true,
          studentId,
          testId,
          questionId,
        })
        .onConflict((oc) =>
          oc.columns(['questionId', 'testId', 'studentId']).doUpdateSet({
            isTouched: true,
          }),
        )
        .returningAll()
        .executeTakeFirst();

      return {
        ...question,
        startedAt,
        endAt: addMinutes(startedAt, question.timeLimit),
        serverTime: new Date().toISOString(),
      };
    });

    return {
      message: 'Question retrieved successfully',
      data,
    };
  }

  async submitAnswer(testId: string, studentId: string, questionId: string, answer: string) {
    // Retrieve the test
    const testAttempt = await this.db
      .selectFrom('test_attempts')
      .leftJoin('tests', 'tests.id', 'test_attempts.testId')
      .selectAll()
      .where('test_attempts.testId', '=', testId)
      .where('test_attempts.studentId', '=', studentId)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Attempt not found', HttpStatus.NOT_FOUND);
      });

    const endsAt = new Date(testAttempt.endsAt);
    const now = new Date();

    // Validate test attempt
    if (testAttempt.status === 'submitted') {
      throw new CustomException("You've already made a submission", HttpStatus.METHOD_NOT_ALLOWED);
    }

    if (now > endsAt) {
      throw new CustomException('The test attempt has already ended', HttpStatus.METHOD_NOT_ALLOWED);
    }
    // Retrieve question
    const question = await this.db
      .selectFrom('questions')
      .selectAll()
      .where('questions.id', '=', questionId)
      .where('testId', '=', testId)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Question not found', HttpStatus.NOT_FOUND);
      });

    const submission = await this.db.selectFrom('student_grading').selectAll().where('questionId', '=', questionId).where('testId', '=', testId).where('student_grading.studentId', '=', studentId).executeTakeFirst();

    if (!submission?.startedAt) throw new CustomException('One or more parameters are missing', HttpStatus.BAD_REQUEST);

    const payload = {
      startedAt: submission.startedAt,
      submittedAt: new Date(),
      isWithinTime: question.timeLimit ? this.isWithinTime(submission.startedAt, question.timeLimit + 2) : this.isWithinTime(testAttempt.startedAt, testAttempt.durationMin + 2),
      autoGraded: (<QuestionType[]>['mcq', 'trueOrFalse']).includes(question.type),
      point: (['mcq', 'trueOrFalse'] as QuestionType[]).includes(question.type) ? (String(answer) === question?.correctAnswer ? question.points : 0) : null,
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
        oc.columns(['testId', 'questionId', 'studentId']).doUpdateSet({
          ...Object.assign(payload, {
            answer: payload.isWithinTime ? answer : submission.answer,
            point: payload.isWithinTime ? payload.point : submission.point,
            submittedAt: payload.isWithinTime ? payload.submittedAt : submission.submittedAt,
          }),
        }),
      )
      .returningAll()
      .executeTakeFirst();

    return {
      message: payload.isWithinTime ? 'Answer submitted successfully' : 'Submitted, but late submission.',
      data: { ...result, serverTime: new Date().toISOString() },
      // serverTime: new Date().toISOString()
    };
  }

  async submitTest(testId: string, studentId: string) {
    // Retrieve the test
    await this.db
      .selectFrom('test_attempts')
      .where('test_attempts.testId', '=', testId)
      .where('test_attempts.studentId', '=', studentId)
      .where('test_attempts.endsAt', '>', new Date())
      .executeTakeFirstOrThrow(() => {
        throw new CustomException("You've already made a submission or attempt not found", HttpStatus.METHOD_NOT_ALLOWED);
      });

    await this.db
      .updateTable('test_attempts')
      .set({
        status: 'submitted',
        submittedAt: new Date(),
      })
      .where('testId', '=', testId)
      .where('studentId', '=', studentId)
      .execute();

    return { message: 'Submission successful', serverTime: new Date().toISOString() };
  }

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
      .where('tests.isDeleted', '=', false)
      .where('tests.id', '=', testId)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Test not found', HttpStatus.FOUND);
      });

    // Now push the data to the attempts table
    const existingAttempt = await this.db.selectFrom('test_attempts').where('studentId', '=', studentId).where('testId', '=', testId).selectAll().executeTakeFirst();
    const startedAt = existingAttempt?.startedAt || new Date();
    const endsAt = new Date(startedAt.getTime() + (test.durationMin + 1) * 60 * 1000);
    let questions = (() => (test.randomizeQuestions ? _.shuffle(test.questions) : test.questions))();
    const currentQuestionId: string = existingAttempt?.currentQuestionId || questions[0].id;

    if (existingAttempt) {
      questions = existingAttempt.questions;
      await this.db.updateTable('test_participants').set({ isTouched: true }).where('studentId', '=', studentId).where('testId', '=', testId).execute();
    } else {
      const result = await this.db
        .insertInto('test_attempts')
        .values({
          testId,
          questions: questions.map((q) => q.id),
          studentId,
          startedAt,
          currentQuestionId: currentQuestionId,
          endsAt,
        })
        .returning('questions')
        .onConflict((oc) => oc.columns(['testId', 'studentId']).doNothing())
        .executeTakeFirst();

      questions = result.questions;
    }

    return {
      message: 'Test retrieved successfully',
      data: {
        ...test,
        randomizeQuestions: undefined,
        questions,
        startedAt,
        status: existingAttempt?.status || 'unsubmitted',
        currentQuestionId: currentQuestionId,
        serverTime: new Date().toISOString(),
      },
    };
  }

  async sendTestInvitationMail(req, { students, testId }: SendTestInvitationMailDto) {
    // Get the test
    const test = await this.db
      .selectFrom('tests')
      .selectAll()
      .where('tests.id', '=', testId)
      .where('tests.isDeleted', '=', false)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Test not found!', HttpStatus.NOT_FOUND);
      });

    // Get the students
    const results = await this.db
      .selectFrom('students')
      .leftJoin('test_attempts', (join) => join.onRef('test_attempts.studentId', '=', 'students.id').on('test_attempts.testId', '=', testId))
      .leftJoin('student_tokens', 'student_tokens.studentId', 'students.id')
      .selectAll()
      .where('test_attempts.studentId', 'is', null)
      .where('students.id', 'in', students)
      .where('student_tokens.testId', '=', testId)
      .execute();

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

    const baseUrl = new ConfigService().get('FRONTEND_BASE_URL');
    await this.emailService.sendEmail({
      to: results.map((x) => ({ email: x.email, name: `${x.firstName} ${x.lastName}` })),
      subject: `You have been invited to take a test! (${test.title})`,
      templateName: 'test-invitation',
      context: results.map((x) => ({
        testUrl: new URL(`/t/${test.code}?token=${x.accessCode}`, baseUrl).toString(),
        studentName: `${x.firstName} ${x.lastName}`,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        testName: test.title,
        fallbackUrl: new URL(`/t/${test.code}?token=${x.accessCode}`, baseUrl).toString(),
        email: x.email,
      })),
    });

    return {
      message: 'Mail sent to all recipients',
    };
  }

  async getResponses(testId: string) {
    // Mark what is graded

    const betterResponses = await this.db
      .selectFrom('students')
      .innerJoin('test_participants', (join) => join.onRef('test_participants.studentId', '=', 'students.id').on('test_participants.testId', '=', testId))
      .innerJoin('test_attempts', (join) =>
        join
          .onRef('test_attempts.studentId', '=', 'students.id')
          .on('test_attempts.testId', '=', testId)
          .on((eb) => eb.or([eb('test_attempts.endsAt', '<', new Date()), eb('test_attempts.status', '=', 'submitted')])),
      )
      .selectAll('students')
      .select((eb) => [
        eb.selectFrom('test_attempts').select(eb.fn.count<number>('test_attempts.id').as('c')).whereRef('test_attempts.testId', '=', 'test_participants.testId').where('test_attempts.endsAt', '>', new Date()).where('test_attempts.status', '=', 'unsubmitted').as('pendingSubmissionsCount'),
        'test_attempts.startedAt',
        'test_attempts.endsAt',
        'test_attempts.submittedAt',
        jsonArrayFrom(
          eb
            .selectFrom('questions')
            .leftJoin('student_grading', (join) => join.onRef('student_grading.questionId', '=', 'questions.id').onRef('student_grading.studentId', '=', 'test_participants.studentId').on('student_grading.testId', '=', testId))
            .where('questions.testId', '=', testId)
            .where((eb) => {
              return eb('questions.isDeleted', '=', false).or('questions.isDeleted', '=', null);
            })
            .select(({ eb }) => [
              'questions.id as questionId',
              'questions.body',
              'questions.options',
              'questions.correctAnswer',
              'questions.type',
              'questions.points as maxPoints',
              'student_grading.autoGraded',
              'student_grading.startedAt',
              'student_grading.isTouched',
              'questions.index',
              'student_grading.answer',
              'student_grading.point',
              'student_grading.isWithinTime',
              'student_grading.id',
              jsonObjectFrom(eb.selectFrom('media').whereRef('media.id', '=', 'questions.mediaId').select(['id', 'url', 'type'])).as('media'),
              // eb.case().when('questions.type', 'in',['mcq', 'trueOrFalse']).then(eb.case().when('student_grading.point', 'is', null).then(0).end()).end().as('point'),
            ]),
        ).as('answers'),
        jsonArrayFrom(eb.selectFrom('media').where('media.testId', '=', testId).whereRef('media.studentId', '=', 'students.id').select(['media.id as id', 'url', 'media.type as type', 'media.createdAt as timestamp'])).as('webcamCaptures'),
      ])
      .where('test_participants.testId', '=', testId)
      .execute();

    //
    // const responses = await this.db.selectFrom('questions').leftJoin('student_grading', 'student_grading.questionId', 'questions.id').where('questions.testId', '=', testId).where((eb) => {
    //   return eb('isDeleted', '=', false).or('isDeleted', '=', null);
    // }).selectAll().select((eb)=>[jsonObjectFrom(eb.selectFrom('students').whereRef('students.id', '=', 'student_grading.studentId').selectAll()).as('studentInfo')]).execute();

    return {
      message: `Submissions for test: ${testId}`,
      data: betterResponses.map((response) => Object.assign(response, { completed: false, pendingSubmissionsCount: Number(response.pendingSubmissionsCount) })),
    };
  }

  async getResult(testId: string, studentId: string) {
    const data = await this.db
      .selectFrom('tests')
      .innerJoin('test_attempts', 'test_attempts.testId', 'tests.id')
      .selectAll('tests')
      .where('testId', '=', testId)
      .where('test_attempts.endsAt', '<', new Date())
      .where((eb) =>
        eb('tests.showResultsAfterTest', '=', true).and(
          eb.not(
            eb.exists(
              eb
                .selectFrom('questions')
                .select('id') // Just selecting a column to check existence
                .where('questions.testId', '=', testId)
                .where('questions.type', 'in', ['essay', 'shortAnswer']),
            ),
          ),
        ),
      )
      .select((eb) => [
        eb
          .selectFrom('questions')
          .where('questions.testId', '=', testId)
          .where((eb) => eb.or([eb('questions.isDeleted', '=', false), eb('questions.isDeleted', 'is', null)]))
          .select((eb) => [eb.fn.sum('questions.points').as('qc')])
          .as('totalTestPoints'),
        jsonArrayFrom(
          eb
            .selectFrom('students')
            .innerJoin('student_grading', 'student_grading.studentId', 'students.id')
            .selectAll('students') // Select student-level data
            .select((eb) => [
              // Total points earned by the student
              eb.fn.coalesce(eb.fn.sum('student_grading.point'), sql<number>`0`).as('finalScore'),
              // Breakdown of counts for partially correct, correct, and incorrect answers
              jsonObjectFrom(
                eb
                  .selectFrom('student_grading')
                  .leftJoin('questions', 'questions.id', 'student_grading.questionId')
                  .select((eb) => [
                    // Count of partially correct answers
                    eb.fn
                      .count(
                        eb
                          .case()
                          .when(
                            eb.and([
                              eb('student_grading.point', '>', 0), // Points greater than 0
                              eb('student_grading.point', '<', eb.ref('questions.points')), // Less than full points
                            ]),
                          )
                          .then(1)
                          .end(),
                      )
                      .as('partiallyCorrectAnswerCount'),

                    // Count of correct answers
                    eb.fn
                      .count(
                        eb
                          .case()
                          .when(
                            eb('student_grading.point', '=', eb.ref('questions.points')), // Full points
                          )
                          .then(1)
                          .end(),
                      )
                      .as('correctAnswerCount'),

                    // Count of incorrect answers
                    eb.fn
                      .count(
                        eb
                          .case()
                          .when(
                            eb('student_grading.point', '=', 0).or('student_grading.answer', 'is', null), // Zero points
                          )
                          .then(1)
                          .end(),
                      )
                      .as('incorrectAnswerCount'),
                  ])
                  .where('questions.testId', '=', testId)
                  .where('student_grading.studentId', '=', studentId) // Match the student in the outer query
                  .where('student_grading.testId', '=', testId),
              ).as('breakdown'),
            ])
            .where('students.id', '=', studentId) // Limit to relevant students
            .where('student_grading.testId', '=', testId) // Ensure grading data matches the test
            .groupBy(['students.id']), // Group by unique student
        ).as('results'),
      ])
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('You cannot get your result through this means.', HttpStatus.NOT_FOUND);
      });

    return {
      message: "Here's your test results",
      data,
    };
  }

  async updateScore(testId: string, point: number, questionId: string, studentId: string, autoGrade: string) {
    await this.db
      .updateTable('student_grading')
      .set({ point, autoGraded: autoGrade === 'true' })
      .where('testId', '=', testId)
      .where('student_grading.studentId', '=', studentId)
      .where('student_grading.questionId', '=', questionId)
      .execute();
    return { message: 'Successfully updated score' };
  }

  async sendTokenToEmail({ email, code }: SendTestTokenDto) {
    // Get the test
    const test = await this.db
      .selectFrom('tests')
      .selectAll()
      .where('tests.code', '=', code)
      .where('tests.isDeleted', '=', false)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Test not found!', HttpStatus.NOT_FOUND);
      });

    // Get the students
    const results = await this.db.selectFrom('students').leftJoin('student_tokens', 'student_tokens.studentId', 'students.id').selectAll().where('students.email', '=', email).where('testId', '=', test.id).execute();

    if (results.length === 0) {
      return {};
      // throw new CustomException('Some students in this list do not exist', HttpStatus.NOT_FOUND);
    }

    // Get the teacher
    // const teacher = await this.db
    //   .selectFrom('teachers')
    //   .selectAll()
    //   .where('id', '=', test.teacherId)
    //   .executeTakeFirstOrThrow(() => {
    //     throw new CustomException('Teacher not found!', HttpStatus.NOT_FOUND);
    //   });

    await this.emailService.sendEmail({
      to: results.map((x) => ({ email: x.email, name: `${x.firstName} ${x.lastName}` })),
      subject: `You requested a PIN for test: ${test.title}`,
      templateName: 'get-token',
      context: results.map((x) => ({
        studentName: `${x.firstName} ${x.lastName}`,
        accessCode: x.accessCode,
        testName: test.title,
        email: x.email,
      })),
    });

    return {
      message: 'Mail sent to all recipients',
    };
  }

  async sendResultToEmail(req, { students, testId }: SendTestResults) {
    const data = await this.db
      .selectFrom('tests')
      .selectAll('tests')
      .select((eb) => [
        eb
          .selectFrom('questions')
          .where('questions.testId', '=', testId)
          .where((eb) => eb.or([eb('questions.isDeleted', '=', false), eb('questions.isDeleted', 'is', null)]))
          .select((eb) => [eb.fn.sum('questions.points').as('qc')])
          .as('totalTestPoints'),
        jsonArrayFrom(
          eb
            .selectFrom('students')
            .innerJoin('student_grading', 'student_grading.studentId', 'students.id')
            .selectAll('students') // Select student-level data
            .select((eb) => [
              // Total points earned by the student
              eb.fn.coalesce(eb.fn.sum('student_grading.point'), sql<number>`0`).as('finalScore'),
              // Breakdown of counts for partially correct, correct, and incorrect answers
              jsonObjectFrom(
                eb
                  .selectFrom('student_grading')
                  .leftJoin('questions', 'questions.id', 'student_grading.questionId')
                  .select((eb) => [
                    // Count of partially correct answers
                    eb.fn
                      .count(
                        eb
                          .case()
                          .when(
                            eb.and([
                              eb('student_grading.point', '>', 0), // Points greater than 0
                              eb('student_grading.point', '<', eb.ref('questions.points')), // Less than full points
                            ]),
                          )
                          .then(1)
                          .end(),
                      )
                      .as('partiallyCorrectAnswerCount'),

                    // Count of correct answers
                    eb.fn
                      .count(
                        eb
                          .case()
                          .when(
                            eb('student_grading.point', '=', eb.ref('questions.points')), // Full points
                          )
                          .then(1)
                          .end(),
                      )
                      .as('correctAnswerCount'),

                    // Count of incorrect answers
                    eb.fn
                      .count(
                        eb
                          .case()
                          .when(
                            eb('student_grading.point', '=', 0).or('student_grading.answer', 'is', null), // Zero points
                          )
                          .then(1)
                          .end(),
                      )
                      .as('incorrectAnswerCount'),
                  ])
                  .where('questions.testId', '=', testId)
                  .whereRef('student_grading.studentId', '=', eb.ref('students.id')) // Match the student in the outer query
                  .where('student_grading.testId', '=', testId), // Match the test ID
              ).as('breakdown'),
            ])
            .where('students.id', 'in', students) // Limit to relevant students
            .where('student_grading.testId', '=', testId) // Ensure grading data matches the test
            .groupBy(['students.id']), // Group by unique student
        ).as('results'),
      ])
      .where('tests.id', '=', testId)
      .where('tests.isDeleted', '=', false)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Test not found!', HttpStatus.NOT_FOUND);
      });

    if (data.results.length === 0) {
      throw new CustomException('Some students in this list do not exist', HttpStatus.NOT_FOUND);
    }

    const teacher = await this.db
      .selectFrom('teachers')
      .selectAll()
      .where('id', '=', (req as any).user.id)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Teacher not found!', HttpStatus.NOT_FOUND);
      });

    await this.emailService.sendEmail({
      to: data.results.map((x) => ({ email: x.email, name: `${x.firstName} ${x.lastName}` })),
      subject: `Your result is ready (${data.title})`,
      templateName: 'result-notification',
      context: data.results.map((x) => ({
        studentName: `${x.firstName} ${x.lastName}`,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        testName: data.title,
        finalScore: x.finalScore,
        totalTestPoints: data.totalTestPoints,
        partiallyCorrectAnswerCount: x.breakdown.partiallyCorrectAnswerCount,
        correctAnswerCount: x.breakdown.correctAnswerCount,
        remark: Number(data.totalTestPoints) > 0 ? ((Number(x.finalScore) / Number(data.totalTestPoints)) * 100 >= 80 ? 'Excellent work!' : (Number(x.finalScore) / Number(data.totalTestPoints)) * 100 >= 50 ? 'Good job!' : 'You can do better,') : 'No score available.',
        incorrectAnswerCount: x.breakdown.incorrectAnswerCount,
        email: x.email,
      })),
    });

    return {
      message: 'Mail sent to all recipients',
    };
  }

  // async markAsGraded({students, testId}){
  //   await this.db.updateTable('test_participants').where("test_participants.testId", '=', testId).where('test_participants.studentId', 'in', students).set({graded: true}).execute();
  //
  //   return {
  //     message: "Students marked as graded"
  //   }
  // }

  private isWithinTime(startedAt: Date, timeLimit: number) {
    const now = new Date();
    const endTime = addMinutes(startedAt, timeLimit);
    return isWithinInterval(now, { start: startedAt, end: endTime });
  }
}
