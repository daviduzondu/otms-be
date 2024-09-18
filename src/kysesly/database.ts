import { Kysely } from 'kysely';
import { DB } from './kysesly-types/kysesly';

export class Database extends Kysely<DB> {}
