-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('submitted', 'unsubmitted');

-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('local', 'google');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video', 'audio');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('mcq', 'trueOrFalse', 'shortAnswer', 'essay');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('active', 'pending', 'completed', 'paused');

-- CreateTable
CREATE TABLE "classes" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploader" TEXT,
    "studentId" TEXT,
    "testId" TEXT,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "testId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "options" TEXT[],
    "correctAnswer" TEXT,
    "body" TEXT NOT NULL,
    "mediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "points" INTEGER NOT NULL DEFAULT 10,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "index" INTEGER NOT NULL DEFAULT 0,
    "timeLimit" INTEGER,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_class" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "removeAfter" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "regNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "addedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "photoId" TEXT,
    "banned" BOOLEAN DEFAULT false,
    "isEmailVerified" BOOLEAN DEFAULT false,
    "authType" "AuthType",
    "institutionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "institutionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" TEXT,
    "printCount" INTEGER,
    "instructions" TEXT,
    "title" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "disableCopyPaste" BOOLEAN DEFAULT false,
    "provideExplanations" BOOLEAN DEFAULT false,
    "randomizeQuestions" BOOLEAN DEFAULT false,
    "requireFullScreen" BOOLEAN DEFAULT true,
    "teacherId" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "showResultsAfterTest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_attempts" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "testId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "questions" TEXT[],
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "AttemptStatus" NOT NULL DEFAULT 'unsubmitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentQuestionId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_participants" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "studentId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origin" TEXT,
    "graded" BOOLEAN NOT NULL DEFAULT false,
    "isTouched" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "test_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_grading" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "studentId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "isTouched" BOOLEAN NOT NULL DEFAULT false,
    "point" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "answer" TEXT,
    "isWithinTime" BOOLEAN,
    "autoGraded" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "student_grading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_tokens" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "studentId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "accessCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teachers_email_key" ON "teachers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tests_code_key" ON "tests"("code");

-- CreateIndex
CREATE UNIQUE INDEX "test_attempts_testId_studentId_key" ON "test_attempts"("testId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "test_participants_testId_studentId_key" ON "test_participants"("testId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "student_grading_questionId_studentId_testId_key" ON "student_grading"("questionId", "studentId", "testId");

-- CreateIndex
CREATE UNIQUE INDEX "student_tokens_testId_studentId_accessCode_key" ON "student_tokens"("testId", "studentId", "accessCode");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_uploader_fkey" FOREIGN KEY ("uploader") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_class" ADD CONSTRAINT "student_class_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_class" ADD CONSTRAINT "student_class_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_currentQuestionId_fkey" FOREIGN KEY ("currentQuestionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_participants" ADD CONSTRAINT "test_participants_origin_fkey" FOREIGN KEY ("origin") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_participants" ADD CONSTRAINT "test_participants_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_participants" ADD CONSTRAINT "test_participants_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_grading" ADD CONSTRAINT "student_grading_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_grading" ADD CONSTRAINT "student_grading_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_grading" ADD CONSTRAINT "student_grading_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_tokens" ADD CONSTRAINT "student_tokens_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_tokens" ADD CONSTRAINT "student_tokens_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
