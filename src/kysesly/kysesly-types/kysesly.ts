import type { ColumnType, GeneratedAlways } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { QuestionType, MediaType, AuthType, TestStatus } from "./enums";

export type institutions = {
    id: GeneratedAlways<string>;
    name: string;
    logo: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type media = {
    id: GeneratedAlways<string>;
    type: MediaType;
    url: string;
    uploader: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type questions = {
    id: GeneratedAlways<string>;
    testId: string;
    type: QuestionType;
    options: string[];
    correctAnswer: string | null;
    body: string;
    mediaId: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type tests = {
    id: GeneratedAlways<string>;
    creatorId: string;
    title: string;
    instructions: string | null;
    printCount: number | null;
    passingScore: Generated<number | null>;
    requireFullScreen: Generated<boolean | null>;
    showCorrectAnswers: Generated<boolean | null>;
    disableCopyPaste: Generated<boolean | null>;
    provideExplanations: Generated<boolean | null>;
    randomizeQuestions: Generated<boolean | null>;
    startsAt: Timestamp | null;
    endsAt: Timestamp | null;
    isRevoked: Generated<boolean>;
    isDeleted: Generated<boolean>;
    institutionId: string | null;
    code: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type users = {
    id: GeneratedAlways<string>;
    firstName: string;
    lastName: string | null;
    /**
     * @email
     */
    email: string;
    password: string | null;
    photoId: string | null;
    banned: Generated<boolean | null>;
    isEmailVerified: Generated<boolean | null>;
    authType: AuthType | null;
    institutionId: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type DB = {
    institutions: institutions;
    media: media;
    questions: questions;
    tests: tests;
    users: users;
};
