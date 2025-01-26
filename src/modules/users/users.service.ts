import { HttpStatus, Injectable } from '@nestjs/common';
import { Database } from '../kysesly/database';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { CreateStudentDto } from './dto/student.dto';
import { CustomException } from '../../exceptions/custom.exception';
import { ClassService } from '../class/class.service';
import { jsonObjectFrom } from 'kysely/helpers/postgres';
import { sql } from 'kysely';

@Injectable()
export class UsersService {
  constructor(
    @InjectKysesly() private db: Database,
    private readonly classService: ClassService,
  ) {}

  async getTeacherRecord({ teacherId, email }: { teacherId?: string; email?: string }) {
    return await this.db
      .selectFrom('teachers')
      .selectAll()
      .where(teacherId ? 'id' : 'email', '=', teacherId ?? email)
      .executeTakeFirst();
  }

  async getTeacherProfile({ teacherId, email }: { teacherId?: string; email?: string }) {
    const teacher = await this.db
      .selectFrom('teachers')
      .leftJoin('media', 'media.uploader', 'teachers.id')
      .leftJoin('tests', 'tests.teacherId', 'teachers.id')
      .select(['teachers.id', 'teachers.firstName', 'teachers.lastName', 'teachers.email', 'teachers.photoId', 'teachers.banned', 'teachers.isEmailVerified', 'tests.id as testId', 'media.id as mediaId', 'media.url as mediaUrl'])
      .where(teacherId ? 'teachers.id' : 'teachers.email', '=', teacherId ?? email)
      .executeTakeFirst();

    if (!teacher) {
      return null; // Handle if no teacher is found
    }

    return {
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      photoId: teacher.photoId,
      banned: teacher.banned,
      isEmailVerified: teacher.isEmailVerified,
      uploads: teacher.mediaId ? [{ id: teacher.mediaId, url: teacher.mediaUrl }] : [],
    };
  }

  async getRecentActivities(teacherId: string, limit: number = 5) {
    const recentClasses = await this.db
      .selectFrom('classes')
      .selectAll()
      .select((eb) => [eb.case().when('classes.updatedAt', '=', eb.ref('classes.createdAt')).then('new_class').else('update_class').end().as('type')])
      .where('classes.teacherId', '=', teacherId)
      .limit(limit)
      .orderBy('updatedAt desc')
      .execute();

    const recentStudents = await this.db
      .selectFrom('students')
      .selectAll()
      .select((eb) => [eb.case().when('students.updatedAt', '=', eb.ref('students.createdAt')).then('new_student').else('update_student').end().as('type')])
      .where('students.addedBy', '=', teacherId)
      .limit(limit)
      .orderBy('updatedAt desc')
      .execute();

    const recentTest = await this.db
      .selectFrom('tests')
      .selectAll('tests')
      .select((eb) => [
        'tests.createdAt',
        'tests.title',
        eb
          .case()
          .when(
            eb.or([
              eb('tests.updatedAt', '>', eb.ref('tests.createdAt')), // Test was updated
            ]),
          )
          .then('update_test')
          .else('new_test')
          .end()
          .as('type'),
      ])
      .where('tests.teacherId', '=', teacherId)
      .orderBy('tests.updatedAt', 'desc')
      .execute();

    const recentQuestions = await this.db
      .selectFrom('questions')
      .innerJoin('tests', (join) => join.on('tests.teacherId', '=', teacherId).onRef('tests.id', '=', 'questions.testId'))
      .select((eb) => ['tests.id as testId', 'tests.title as title', 'questions.createdAt as createdAt', 'questions.updatedAt as createdAt', 'questions.id', eb.case().when('questions.createdAt', '=', eb.ref('questions.updatedAt')).then('new_question').else('update_question').end().as('type')])
      .execute();

    return { data: [...recentClasses, ...recentStudents, ...recentTest, ...recentQuestions] };
  }

  async getAllStudents(teacherId: string) {
    const data = await this.db.selectFrom('students').selectAll().where('addedBy', '=', teacherId).execute();

    return {
      message: 'Students retrieved sucessfully',
      data,
    };
  }

  async createStudent(createStudentDto: CreateStudentDto, req) {
    const createStudentDtoClone = structuredClone(createStudentDto);
    const student = await this.db
      .insertInto('students')
      .values(Object.assign(createStudentDto, { addedBy: req.user.id, classId: undefined, removeAfter: undefined }))
      .returningAll()
      .executeTakeFirstOrThrow(() => {
        return new CustomException('Failed to add student', HttpStatus.BAD_REQUEST);
      });

    if (createStudentDtoClone.removeAfter && createStudentDtoClone.classId) {
      return await this.classService.addStudentToClass({
        studentId: student.id,
        removeAfter: createStudentDtoClone.removeAfter,
        classId: createStudentDtoClone.classId,
      });
    }

    return {
      message: 'Student created successfully',
      data: student,
    };
  }

  async findStudentByEmail(email: string, req: any) {
    // await new Promise((res) => setTimeout(res, 3000));
    const student = await this.db
      .selectFrom('students')
      .selectAll()
      .where('addedBy', '=', req.user.id)
      .where('email', '=', email)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Could not find student', HttpStatus.NOT_FOUND);
      });

    return {
      message: 'Student found',
      data: student,
    };
  }

  async getStudentByAccessCode(accessCode: string) {
    const student = await this.db
      .selectFrom('students')
      .innerJoin('student_tokens', 'student_tokens.studentId', 'students.id')
      .innerJoin('tests', 'tests.id', 'student_tokens.testId')
      .innerJoin('test_participants', join=>join.onRef('test_participants.studentId', '=', 'student_tokens.studentId').onRef('test_participants.testId', '=', 'student_tokens.testId'))
      .where('student_tokens.accessCode', '=', accessCode)
      .selectAll()
      .select((eb) => ['test_participants.isTouched as isTouched',
        eb.case().when(eb('tests.showResultsAfterTest', '=', true).and(
          eb.not(
            eb.exists(
              eb
                .selectFrom('questions')
                .select('id') // Just selecting a column to check existence
                .whereRef('questions.testId', '=', 'tests.id')
                .where('questions.type', 'in', ['essay', 'shortAnswer']),
            ),
          ),
        )).then(true).else(false).end().as('resultReady'),
        jsonObjectFrom(eb.selectFrom('tests').where('tests.isDeleted', '=', false).whereRef('tests.id', '=', 'student_tokens.testId').selectAll()).as('testInfo')])
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Failed to retrieve student information. Contact teacher for help.', HttpStatus.NOT_FOUND);
      });

    return {
      message: 'Student found',
      data: student,
    };
  }
}
