import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Kysely, PostgresDialect } from 'kysely';
import { CONNECTION } from '../../constants/tokens';
import { DB } from './kysesly-types/kysesly';

@Global()
@Module({
  providers: [
    {
      provide: CONNECTION,
      useFactory: async () => {
        const dialect = new PostgresDialect({
          pool: new Pool({
            connectionString: new ConfigService().get('DATABASE_URL'),
          }),
        });
        return new Kysely<DB>({ dialect, log: ['query', 'error'] });
      },
    },
  ],
  exports: [CONNECTION],
})
export class KyseslyModule {}
