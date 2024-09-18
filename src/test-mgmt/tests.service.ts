import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectKysesly } from '../kysesly/decorators/inject-repository';
import { Database } from '../kysesly/database';
import { CreateTestDto } from './dto/create-test.dto';
import { Request } from 'express';
import { tests } from '../kysesly/kysesly-types/kysesly';
import { CustomException } from '../exceptions/custom.exception';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { customAlphabet } = require('fix-esm').require('nanoid');

@Injectable()
export class TestsService {
  constructor(@InjectKysesly() private db: Database) {}

  private async generateTestCode() {
    return customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 21)(7);
  }

  async createNewTest(payload: CreateTestDto, req: Request) {
    Object.assign(payload, {
      code: await this.generateTestCode(),
      creatorId: (req as any).user.id,
    } as tests);

    const test = await this.db
      .insertInto('tests')
      .values(payload)
      .returningAll()
      .executeTakeFirst();

    return {
      message: 'Test Creation Sucessful',
      data: test,
    };
  }

  async getTest(id: string, req: Request) {
    const test = await this.db
      .selectFrom('tests')
      .selectAll()
      .where('id', '=', id)
      .where('creatorId', '=', (req as any).user.id)
      .executeTakeFirstOrThrow(() => {
        return new CustomException('Test not found', HttpStatus.NOT_FOUND);
      });
    return {
      message: 'Test retrieved successfully',
      data: test,
    };
  }
}
