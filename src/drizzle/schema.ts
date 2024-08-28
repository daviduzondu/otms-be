import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const questionTypeEnum = pgEnum('questionType', [
  'mcq',
  'trueOrFalse',
  'shortAnswer',
]);

export const mediaTypeEnum = pgEnum('mediaType', [
  'image',
  'video',
  'pdf',
  'audio',
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  profilePic: uuid('profilePic').references(() => media.id),
  firstName: varchar('firstName'),
  lastName: varchar('lastName'),
  password: varchar('password'),
  email: varchar('email').unique().notNull(),
  institutionId: uuid('institutionId').references(() => institutions.id),
  isEmailVerified: boolean('isEmailVerified').default(false),
});

export const institutions = pgTable('institutions', {
  id: uuid('id').primaryKey(),
  name: varchar('name').notNull(),
  logo: varchar('logo'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export const media = pgTable('media', {
  id: uuid('id').primaryKey(),
  type: mediaTypeEnum('type'),
  url: varchar('url'),
  uploader: uuid('uploadedBy')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => sql`now()`),
});

export const tests = pgTable('tests', {
  id: uuid('id').primaryKey(),
  creatorId: uuid('creatorId').references(() => users.id),
  isOffline: boolean('isOffline').default(false),
  offlinePrintCount: integer('offlinePrintCount'),
  participantsCount: integer('participantsCount'),
  maxParticipants: integer('maxParticipants'),
  startsAt: timestamp('startsAt').notNull(),
  endsAt: timestamp('endsAt').notNull(),
  institution: uuid('institution').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
  institutionId: uuid('institution').references(() => institutions.id),
});

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey(),
  testId: uuid('testId').references(() => tests.id),
  body: text('body').notNull(),
  type: questionTypeEnum('type').notNull(),
  mediaId: uuid('mediaId').references(() => media.id),
  options: text('options').array(),
  correctAnswer: varchar('correctAnswer'),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
});

export const userRelations = relations(users, ({ many }) => ({
  media: many(media),
  tests: many(tests),
}));

export const institutionRelations = relations(institutions, ({ many }) => ({
  users: many(users),
  tests: many(tests),
}));

export const testRelations = relations(tests, ({ many }) => ({
  questions: many(questions),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, { fields: [users.id], references: [users.id] }),
}));
