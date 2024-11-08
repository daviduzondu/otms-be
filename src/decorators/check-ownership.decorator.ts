import { SetMetadata } from '@nestjs/common';
import { DB } from '../modules/kysesly/kysesly-types/kysesly';
import { Request } from 'express';

export type TableName = keyof DB;
export type ForeignKey<T extends TableName> = keyof DB[T];

export default function CheckOwnership<T extends TableName>({ table, foreignKey, column, pathOnReq }: { table: T; foreignKey: ForeignKey<T>; column: ForeignKey<T>; pathOnReq: [keyof Request, string] }) {
  return SetMetadata('resource', {
    table,
    foreignKey,
    column,
    pathOnReq,
  });
}
