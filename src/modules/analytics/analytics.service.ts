import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { Database } from '../kysesly/database';
import { CustomException } from '../../exceptions/custom.exception';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';
import { sql } from 'kysely';

@Injectable()
export class AnalyticsService {
  constructor(@InjectKysesly() private db: Database) {}

  async getDashboardOverview(teacherId: string) {
    const data = await this.db
      .selectFrom('teachers')
      .where('teachers.id', '=', teacherId)
      .select((eb) => [
        eb.selectFrom('tests').where('tests.teacherId', '=', teacherId).where('tests.isDeleted', '=', false).select(eb.fn.count('id').as('c')).as('testCount'),
        eb.selectFrom('classes').where('classes.teacherId', '=', teacherId).select(eb.fn.count('id').as('c')).as('classes'),
        eb.selectFrom('students').where('students.addedBy', '=', teacherId).select(eb.fn.count('id').as('c')).as('totalStudents'),
        jsonArrayFrom(
          eb
            .selectFrom('student_grading')
            .innerJoin('tests', (join) => join.onRef('student_grading.testId', '=', 'tests.id').on('tests.teacherId', '=', teacherId))
            .innerJoin('students', (join) => join.onRef('students.id', '=', 'student_grading.studentId').on('students.addedBy', '=', teacherId))
            .innerJoin('questions', (join) => join.onRef('questions.testId', '=', 'tests.id').on('questions.isDeleted', '=', false))
            .select((eb) => ['student_grading.testId as testId', eb.fn.sum('student_grading.point').as('earnedPoints'), eb.fn.sum('questions.points').as('possiblePoints')])
            .groupBy('student_grading.testId'),
        ).as('testAverages'),

        // eb
        //   .selectFrom('student_grading')
        //   .innerJoin('students', (join) => join.onRef('students.id', '=', 'student_grading.studentId').on('students.addedBy', '=', teacherId))
        //   .select((eb) => eb.fn.sum('student_grading.point').as('tpe'))
        //   .as('totalPointsEarned'),
        // eb
        //   .selectFrom('questions')
        //   .innerJoin('tests', (join) => join.onRef('questions.testId', '=', 'tests.id').on('tests.teacherId', '=', teacherId))
        //   .where((eb) => {
        //     return eb('questions.isDeleted', '=', false).or('questions.isDeleted', '=', null);
        //   })
        //   .select((eb) => eb.fn.sum('questions.points').as('tpp'))
        //   .as('totalPossiblePoints'),
      ])
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Failed to retrieve data');
      });

    let sumPercentages = 0;

    for (const row of data.testAverages) {
      // Convert the values to numbers, then compute the percentage for each test.
      const earned = Number(row.earnedPoints);
      const possible = Number(row.possiblePoints);

      // Guard against division by zero.
      const testPercentage = possible > 0 ? earned / possible : 0;
      sumPercentages += testPercentage;
    }

    // Calculate the average fraction and convert to percentage (0 - 100).
    const averagePerformanceFraction = data.testAverages.length > 0 ? sumPercentages / data.testAverages.length : 0;
    const averagePerformancePercentage = averagePerformanceFraction * 100;

    return {
      message: 'Dashboard summary retrieved successfully',
      data: { ...data, totalStudents: Number(data.totalStudents), averagePerformance: averagePerformancePercentage, classes: Number(data.classes), testCount: Number(data.testCount) },
    };
  }

  async getTestMetrics(testId: string, teacherId: string) {
    const newData = await this.db
      .selectFrom('tests')
      .selectAll()
      .where('tests.id', '=', testId)
      .where('tests.teacherId', '=', teacherId)
      .where('tests.isDeleted', '=', false)
      .select((eb) => [
        eb.selectFrom('test_participants').where('test_participants.testId', '=', testId).select(eb.fn.count('id').as('c')).as('totalParticipants'),
        jsonArrayFrom(
          eb
            .selectFrom('students')
            .innerJoin('test_participants', (join) => join.onRef('test_participants.studentId', '=', 'students.id').on('test_participants.testId', '=', testId))
            .innerJoin('test_attempts', (join) =>
              join
                .onRef('test_attempts.studentId', '=', 'students.id')
                .on('test_attempts.testId', '=', testId)
                .on((eb) => eb.or([eb('test_attempts.endsAt', '<', new Date()), eb('test_attempts.status', '=', 'submitted')])),
            )
            .leftJoin('student_grading', 'student_grading.studentId', 'students.id')
            .where('student_grading.testId', '=', testId)
            .where('test_attempts.testId', '=', testId)
            .where((eb) => eb.or([eb('test_attempts.endsAt', '<', new Date()), eb('test_attempts.status', '=', 'submitted')]))
            .groupBy(['test_participants.origin', 'students.id', 'students.firstName', 'students.lastName'])
            .select((eb) => [jsonObjectFrom(eb.selectFrom('classes').whereRef('classes.id', '=', 'test_participants.origin').selectAll()).as('class'), 'students.id as id', 'students.firstName as firstName', 'students.lastName as lastName', eb.fn.sum('student_grading.point').as('totalPoints')]),
        ).as('attempts'),
        jsonArrayFrom(
          eb
            .selectFrom('questions')
            .leftJoin('student_grading', 'student_grading.questionId', 'questions.id')
            .where((eb) => eb.or([eb('questions.isDeleted', '=', false), eb('questions.isDeleted', '=', null)]))
            .where('questions.testId', '=', testId)
            .where((eb) => eb('student_grading.answer', 'is not', null))
            .where((eb) => eb.and([eb('student_grading.startedAt', 'is not', null), eb('student_grading.submittedAt', 'is not', null)]))
            .groupBy(['questions.id', 'questions.points'])
            .select((eb) => [
              'questions.id as questionId',
              'questions.points',
              'questions.body',
              'questions.index as index',
              jsonArrayFrom(
                eb
                  .selectFrom('student_grading')
                  .innerJoin('students', 'students.id', 'student_grading.studentId')
                  .innerJoin('test_attempts', (join) =>
                    join
                      .onRef('test_attempts.studentId', '=', 'student_grading.studentId')
                      .on('test_attempts.testId', '=', testId)
                      .on((eb) => eb.or([eb('test_attempts.endsAt', '<', new Date()), eb('test_attempts.status', '=', 'submitted')])),
                  )
                  .select(['student_grading.id', 'students.firstName as firstName', 'students.lastName as lastName', 'student_grading.point', 'student_grading.answer', 'student_grading.submittedAt'])
                  .where('student_grading.testId', '=', testId)
                  .whereRef('student_grading.questionId', '=', 'questions.id'),
              ).as('responses'),
              eb.fn.avg(sql`EXTRACT(EPOCH FROM ("student_grading"."submittedAt" - "student_grading"."startedAt"))`).as('averageTimeSpentInSeconds'),
              eb.fn.count('student_grading.id').as('answerCount'),
            ]),
        ).as('questionStats'),
      ])
      .groupBy('tests.id')
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Failed to retrieve test metrics', HttpStatus.NOT_FOUND);
      });

    return {
      message: 'Test metrics retrieve successfully',
      data: newData,
    };
  }

  async getOverallStudentPerformance(studentId: string) {
    const data = await this.db
      .selectFrom('tests')
      .where('tests.isDeleted', '=', false)
      .innerJoin('test_attempts', (join) => join.onRef('test_attempts.testId', '=', 'tests.id'))
      .innerJoin('student_grading', (join) => join.onRef('student_grading.testId', '=', 'tests.id'))
      .where('test_attempts.studentId', '=', studentId) // Filter by the student's ID
      .selectAll('tests') // Select all columns from the "tests" table
      .select((eb) => [eb.fn.sum('student_grading.point').as('totalPoints'), 'test_attempts.startedAt', eb.fn.coalesce(eb.ref('test_attempts.submittedAt'), eb.ref('test_attempts.endsAt')).as('submittedAt')])
      .groupBy(['test_attempts.submittedAt', 'test_attempts.startedAt', 'tests.id', 'test_attempts.endsAt'])
      .execute();

    return {
      message: 'Student overall performance retrieved',
      data,
    };
  }
}
