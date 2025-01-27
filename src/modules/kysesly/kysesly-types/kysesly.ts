import type { ColumnType, GeneratedAlways } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { AttemptStatus, MediaType, QuestionType, Platform } from "./enums";

export type branding = {
    id: GeneratedAlways<string>;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
    addedBy: string;
    mediaId: string;
    field1: string | null;
    field2: string | null;
    field3: string | null;
};
export type classes = {
    id: GeneratedAlways<string>;
    name: string;
    teacherId: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type media = {
    id: GeneratedAlways<string>;
    type: MediaType;
    url: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
    uploader: string | null;
    studentId: string | null;
    testId: string | null;
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
    timeLimit: number | null;
};
export type student_class = {
    id: GeneratedAlways<string>;
    studentId: string;
    classId: string;
    removeAfter: Timestamp;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type student_grading = {
    id: GeneratedAlways<string>;
    studentId: string;
    questionId: string;
    testId: string;
    isTouched: Generated<boolean>;
    point: number | null;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
    startedAt: Timestamp | null;
    answer: string | null;
    isWithinTime: boolean | null;
    autoGraded: Generated<boolean>;
    submittedAt: Timestamp | null;
};
export type student_tokens = {
    id: GeneratedAlways<string>;
    studentId: string;
    testId: string;
    accessCode: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type students = {
    id: GeneratedAlways<string>;
    email: string;
    regNumber: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    addedBy: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
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
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
};
export type test_attempts = {
    id: GeneratedAlways<string>;
    testId: string;
    studentId: string;
    questions: string[];
    startedAt: Timestamp;
    endsAt: Timestamp;
    status: Generated<AttemptStatus>;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
    currentQuestionId: string;
    submittedAt: Timestamp | null;
};
export type test_participants = {
    id: GeneratedAlways<string>;
    studentId: string;
    testId: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
    origin: string | null;
    graded: Generated<boolean>;
    isTouched: Generated<boolean>;
};
export type tests = {
    id: GeneratedAlways<string>;
    createdAt: Generated<Timestamp>;
    updatedAt: Generated<Timestamp>;
    code: string | null;
    printCount: number | null;
    instructions: string | null;
    title: string;
    isDeleted: Generated<boolean>;
    isRevoked: Generated<boolean>;
    disableCopyPaste: Generated<boolean | null>;
    randomizeQuestions: Generated<boolean | null>;
    requireFullScreen: Generated<boolean | null>;
    teacherId: string;
    durationMin: Generated<number>;
    showResultsAfterTest: Generated<boolean>;
    platform: Generated<Platform>;
};
export type DB = {
    branding: branding;
    classes: classes;
    media: media;
    questions: questions;
    student_class: student_class;
    student_grading: student_grading;
    student_tokens: student_tokens;
    students: students;
    teachers: teachers;
    test_attempts: test_attempts;
    test_participants: test_participants;
    tests: tests;
};
