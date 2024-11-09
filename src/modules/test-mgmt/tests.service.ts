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
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { customAlphabet } = require('fix-esm').require('nanoid');

@Injectable()
export class TestService {
  constructor(
    @InjectKysesly() private db: Database,
    private readonly emailService: EmailService,
  ) {}

  private async generateTestCode() {
    return customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 21)(7);
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
    const results = await this.db.selectFrom('students').selectAll().where('id', 'in', students).execute();
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

    const testUrl = new URL(path.join(new ConfigService().get('FRONTEND_BASE_URL'), 't', `${test.code}?token=somethingrandom`));
    await this.emailService.sendEmail({
      to: results.map((x) => ({ email: x.email, name: `${x.firstName} ${x.lastName}` })),
      subject: 'You have been invited to take a test!',
      templateName: 'test-invitation',
      context: results.map((x) => ({
        testUrl,
        studentName: `${x.firstName} ${x.lastName}`,
        teacherName: `${teacher.firstName} ${teacher.lastName}`,
        testName: test.title,
        fallbackUrl: testUrl,
        email: x.email,
      })),
    });

    return {
      message: 'Mail sent to all receipients',
    };
  }
}
