import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../drizzle/schema';
import { DRIZZLE_ASYNC_PROVIDER } from './drizzle.options';

@Injectable()
export class DrizzleService {
  constructor(
    @Inject(DRIZZLE_ASYNC_PROVIDER) readonly db: NodePgDatabase<typeof schema>,
  ) {}
}
