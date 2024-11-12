import { HttpStatus, Injectable, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { Database } from '../kysesly/database';
import { CreateClassDto } from './dto/class.dto';
import { CustomException } from '../../exceptions/custom.exception';
import { AddStudentToClassDto } from '../users/dto/student.dto';

@Injectable()
@UseGuards(JwtAuthGuard)
export class ClassService {
  constructor(@InjectKysesly() private readonly db: Database) {}

  async getClassDetails(classId: string) {
    const classDetails = await this.db.selectFrom('classes').innerJoin('student_class', 'classes.id', 'student_class.classId').innerJoin('students', 'students.id', 'student_class.studentId').select(['classes.id as id', 'classes.name as name', 'students.id as studentId', 'firstName', 'lastName', 'regNumber', 'middleName', 'removeAfter']).where('classes.id', '=', classId).execute();

    const formattedClass = {
      id: classDetails[0]?.id,
      name: classDetails[0]?.name,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      students: classDetails.map(({ studentId, id, removeAfter, name, ...rest }) => ({
        id: studentId,
        ...rest,
      })),
    };

    return {
      message: 'Class retrieved successfully',
      data: formattedClass,
    };
  }

  async getClasses(req) {
    const classes = await this.db
      .selectFrom('classes')
      .leftJoin('student_class', 'classes.id', 'classId')
      .leftJoin('students', 'students.id', 'studentId')
      .select([
        'classes.id as id', // Ensure we're always selecting class.id as a fallback
        'name',
        'students.firstName',
        'students.lastName',
        'students.email',
        'regNumber',
        'students.id as studentId',
      ])
      .where('teacherId', '=', (req as any).user.id)
      .execute();

    return {
      message: 'Classes retrieved successfully',
      data: Object.entries(Object.groupBy(classes, (o) => o.id)).map(([id, students]) => ({
        id,
        name: students[0].name,
        students: students
          .filter((student) => student.studentId !== null) // Filter out empty student entries
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .map(({ name, studentId: id, ...rest }) => ({ ...rest, id })),
      })),
    };
  }

  async addStudentToClass(addStudentToClassDto: AddStudentToClassDto) {
    // Check if the student exists
    await this.db
      .selectFrom('students')
      .where('id', '=', addStudentToClassDto.studentId)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Student does not exist', HttpStatus.NOT_FOUND);
      });

    // Check if the student is already in the class
    const studentExistsInClass = await this.db.selectFrom('student_class').selectAll().where('studentId', '=', addStudentToClassDto.studentId).where('classId', '=', addStudentToClassDto.classId).executeTakeFirst();

    if (studentExistsInClass) {
      throw new CustomException('Student already in class', HttpStatus.CONFLICT);
    }

    // Add the student to the class
    const result = await this.db.insertInto('student_class').values(addStudentToClassDto).returning(['studentId as id', 'classId']).executeTakeFirst();
    return {
      message: 'Student successfully added to class',
      data: result,
    };
  }

  async createClass({ name }: CreateClassDto, req) {
    const classExists = await this.db
      .selectFrom('classes')
      .selectAll()
      .where('teacherId', '=', (req as any).user.id)
      .where('name', '=', name.toLowerCase())
      .executeTakeFirst();

    if (classExists) {
      throw new CustomException(`You already have a class called "${name}"`, HttpStatus.CONFLICT);
    }

    const classInfo = await this.db
      .insertInto('classes')
      .values({ name, teacherId: (req as any).user.id })
      .returning(['id', 'name'])
      .executeTakeFirst();

    return {
      message: 'Class created successfully',
      data: Object.assign(classInfo, { students: [] }),
    };
  }
}
