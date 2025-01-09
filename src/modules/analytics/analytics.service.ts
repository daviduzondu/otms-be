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
        eb.selectFrom('tests').whereRef('tests.teacherId', '=', 'teachers.id').select(eb.fn.count('id').as('c')).as('testCount'),
        eb.selectFrom('classes').whereRef('classes.teacherId', '=', 'teachers.id').select(eb.fn.count('id').as('c')).as('classes'),
        eb.selectFrom('students').whereRef('students.addedBy', '=', 'teachers.id').select(eb.fn.count('id').as('c')).as('totalStudents'),
        eb
          .selectFrom('student_grading')
          .innerJoin('students', (join) => join.onRef('students.id', '=', 'student_grading.studentId').onRef('students.addedBy', '=', 'teachers.id'))
          .select((eb) => eb.fn.sum('student_grading.point').as('tpe'))
          .as('totalPointsEarned'),
        eb
          .selectFrom('questions')
          .innerJoin('tests', (join) => join.onRef('questions.testId', '=', 'tests.id').onRef('tests.teacherId', '=', 'teachers.id'))
          .where((eb) => {
            return eb('questions.isDeleted', '=', false).or('questions.isDeleted', '=', null);
          })
          .select((eb) => eb.fn.sum('questions.points').as('tpp'))
          .as('totalPossiblePoints'),
      ])
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Failed to retrieve data');
      });

    return {
      message: 'Dashboard summary retrieved successfully',
      data: { ...data, totalStudents: Number(data.totalStudents), classes: Number(data.classes), testCount: Number(data.testCount), averagePerformance: (Number(data.totalPointsEarned) / Number(data.totalPossiblePoints)) * 100, totalPointsEarned: undefined, totalPossiblePoints: undefined },
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
        jsonArrayFrom(
          eb
            .selectFrom('students')
            .leftJoin('test_attempts', (join) => join.onRef('test_attempts.studentId', '=', 'students.id'))
            .leftJoin('test_participants', 'test_participants.studentId', 'students.id')
            .leftJoin('student_grading', 'student_grading.studentId', 'students.id')
            .where((eb) =>
              eb.or([
                eb('test_attempts.endsAt', '<', new Date()),
                eb('test_attempts.status', '=', 'submitted'),
              ])
            )
            .groupBy(['test_participants.origin', 'students.id', 'students.firstName', 'students.lastName'])
            .select((eb) => [
              jsonObjectFrom(
                eb.selectFrom('classes').whereRef('classes.id', '=', 'test_participants.origin').selectAll()
              ).as('class'),
              'students.id as id',
              'students.firstName as firstName',
              'students.lastName as lastName',
              eb.fn.sum('student_grading.point').as('totalPoints'),
            ])
        ).as('attempts'),
        jsonArrayFrom(
          eb
            .selectFrom('questions')
            .leftJoin('student_grading', 'student_grading.questionId', 'questions.id')
            .where((eb) => eb.or([eb('questions.isDeleted', '=', false), eb('questions.isDeleted', '=', null)]))
            .where('questions.testId', '=', testId)
            .where((eb) => eb('student_grading.answer', 'is not', null))
            .where((eb) =>
              eb.and([eb('student_grading.startedAt', 'is not', null), eb('student_grading.submittedAt', 'is not', null)])
            )
            .groupBy(['questions.id', 'questions.points'])
            .select((eb) => [
              'questions.id as questionId',
              'questions.points',
              eb.fn.avg(
                sql`EXTRACT(EPOCH FROM ("student_grading"."submittedAt" - "student_grading"."startedAt"))`
              ).as('averageTimeSpentInSeconds'),
              eb.fn.count('student_grading.id').as('answerCount'),
            ])
        ).as('questionStats'),
      ])
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Failed to retrieve test metrics', HttpStatus.NOT_FOUND);
      });

    return {
      message: "Test metrics retrieve successfully", 
      data: newData
    }
  }

  async getOverallStudentPerformance(studentId: string) {
    const data = await this.db
      .selectFrom('tests')
      .innerJoin('test_participants', (join) =>
        join.onRef('test_participants.testId', '=', 'tests.id')
      )
      .innerJoin('student_grading', (join)=> join.onRef('student_grading.testId', '=', 'tests.id'))
      .where('test_participants.studentId', '=', studentId) // Filter by the student's ID
      .selectAll('tests') // Select all columns from the "tests" table
      .select(eb=>[
        eb.fn.sum('student_grading.point').as('totalPoints'),
      ])
      .groupBy('tests.id')
      .execute();

    return {
      message: "Student overall performance retrieved",
      data
    }
  }

}
