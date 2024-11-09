import type { ColumnType, GeneratedAlways } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { AuthType, MediaType, QuestionType, TestStatus } from "./enums";

export type classes = {
    id: GeneratedAlways<string>;
    name: string;
    teacherId: string;
};
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
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
    teacherId: string;
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
    points: Generated<number>;
    isDeleted: Generated<boolean>;
    index: Generated<number>;
};
export type student_class = {
    id: GeneratedAlways<string>;
    studentId: string;
    classId: string;
    removeAfter: Timestamp;
};
export type StudentClasses = {
    A: string;
    B: string;
};
export type students = {
    id: GeneratedAlways<string>;
    email: string;
    regNumber: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    addedBy: string;
};
export type teachers = {
    id: GeneratedAlways<string>;
    firstName: string;
    lastName: string | null;
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
export type tests = {
    id: GeneratedAlways<string>;
    endsAt: Timestamp | null;
    institutionId: string | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
    code: string | null;
    printCount: number | null;
    instructions: string | null;
    title: string;
    isDeleted: Generated<boolean>;
    isRevoked: Generated<boolean>;
    startsAt: Timestamp | null;
    disableCopyPaste: Generated<boolean | null>;
    passingScore: Generated<number | null>;
    provideExplanations: Generated<boolean | null>;
    randomizeQuestions: Generated<boolean | null>;
    requireFullScreen: Generated<boolean | null>;
    showCorrectAnswers: Generated<boolean | null>;
    teacherId: string;
};
export type DB = {
    _StudentClasses: StudentClasses;
    classes: classes;
    institutions: institutions;
    media: media;
    questions: questions;
    student_class: student_class;
    students: students;
    teachers: teachers;
    tests: tests;
};
