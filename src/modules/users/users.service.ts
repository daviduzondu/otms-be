import { HttpStatus, Injectable } from '@nestjs/common';
import { Database } from '../kysesly/database';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { CreateStudentDto } from './dto/student.dto';
import { CustomException } from '../../exceptions/custom.exception';

@Injectable()
export class UsersService {
  constructor(@InjectKysesly() private db: Database) {}

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
      .leftJoin('institutions', 'teachers.institutionId', 'institutions.id')
      .leftJoin('media', 'media.teacherId', 'teachers.id')
      .leftJoin('tests', 'tests.teacherId', 'teachers.id')
      .select(['teachers.id', 'teachers.firstName', 'teachers.lastName', 'teachers.email', 'teachers.photoId', 'teachers.banned', 'teachers.isEmailVerified', 'teachers.authType', 'tests.id as testId', 'institutions.id as institutionId', 'institutions.name as institutionName', 'media.id as mediaId', 'media.url as mediaUrl'])
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
      authType: teacher.authType,
      institution: teacher.institutionId ? [{ id: teacher.institutionId, name: teacher.institutionName }] : [],
      uploads: teacher.mediaId ? [{ id: teacher.mediaId, url: teacher.mediaUrl }] : [],
    };
  }

  async createStudent(CreateStudentDto: CreateStudentDto) {
    const student = await this.db
      .insertInto('students')
      .values(CreateStudentDto)
      .returningAll()
      .executeTakeFirstOrThrow(() => {
        return new CustomException('Failed to add student', HttpStatus.BAD_REQUEST);
      });

    return {
      message: 'Student created successfully',
      data: student,
    };
  }
}
