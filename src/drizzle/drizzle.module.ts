import { Global, Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { DrizzleService } from './drizzle.service';
import { DRIZZLE_ASYNC_PROVIDER } from './drizzle.options';

@Global()
@Module({
  providers: [
    DrizzleService,
    {
      provide: DRIZZLE_ASYNC_PROVIDER,
      useFactory: async () => {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
        });
        const db = drizzle(pool, { schema });
        return db;
      },
    },
  ],
  exports: [DrizzleService],
})
export class DrizzleModule {}
