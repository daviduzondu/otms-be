import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectKysesly } from '../modules/kysesly/decorators/inject-repository';
import { Database } from '../modules/kysesly/database';
import { ForeignKey, TableName } from '../decorators/check-ownership.decorator';
import { CustomException } from '../exceptions/custom.exception';
import { Request } from 'express';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectKysesly() private db: Database,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest() as Request;
    const { table, foreignKey, column, pathOnReq } = this.reflector.get<{
      table: TableName;
      foreignKey: ForeignKey<TableName>;
      column: ForeignKey<TableName>;
      pathOnReq: [keyof Request, string];
    }>('resource', context.getHandler());

    await this.db
      .selectFrom(table)
      .selectAll()
      .where(column, '=', req[pathOnReq[0]][pathOnReq[1]])
      .where(foreignKey, '=', (req.user as any).id)
      .executeTakeFirstOrThrow(() => {
        throw new CustomException('You do not have access to this resource or it does not exist.', HttpStatus.NOT_FOUND);
      });
    return true;
  }
}
