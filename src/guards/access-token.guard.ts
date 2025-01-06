import { CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { InjectKysesly } from '../modules/kysesly/decorators/inject-repository';
import { Database } from '../modules/kysesly/database';
import { CustomException } from '../exceptions/custom.exception';

export class AccessTokenGuard implements CanActivate {
  constructor(@InjectKysesly() private db: Database) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (!req.headers['x-access-token']) {
      throw new CustomException('Access token is required', HttpStatus.UNAUTHORIZED);
    }
    const accessToken = req.headers['x-access-token'];
    req.student = await this.db
      .selectFrom('student_tokens')
      .innerJoin('students', 'students.id', 'student_tokens.studentId')
      .where('student_tokens.accessCode', '=', accessToken)
      .select(['students.id', 'student_tokens.accessCode'])
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('Failed to retrieve info for student with access token: ', HttpStatus.NOT_FOUND);
      });

    return true;
  }
}
