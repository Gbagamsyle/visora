-- CreateEnum
CREATE TYPE "FlashcardRating" AS ENUM ('AGAIN', 'HARD', 'GOOD', 'EASY');

-- AlterTable
ALTER TABLE "Question"
    ADD COLUMN "topicId" UUID,
    ADD COLUMN "examYear" INTEGER,
    ADD COLUMN "examSession" TEXT;

ALTER TABLE "TestAttempt"
    ADD COLUMN "expiresAt" TIMESTAMP(3);

ALTER TABLE "AttemptAnswer"
    ADD COLUMN "needsReview" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "questionBody" TEXT,
    ADD COLUMN "questionType" "QuestionType",
    ADD COLUMN "explanation" TEXT,
    ADD COLUMN "correctAnswer" TEXT,
    ADD COLUMN "markingGuide" TEXT,
    ADD COLUMN "optionsSnapshot" JSONB;

-- CreateTable
CREATE TABLE "Flashcard" (
    "id" UUID NOT NULL,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "universityId" UUID,
    "programId" UUID,
    "courseId" UUID,
    "topicId" UUID,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flashcard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlashcardReview" (
    "userId" UUID NOT NULL,
    "flashcardId" UUID NOT NULL,
    "rating" "FlashcardRating" NOT NULL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "nextDueAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FlashcardReview_pkey" PRIMARY KEY ("userId", "flashcardId")
);

-- CreateIndex
CREATE INDEX "Question_topicId_isPublished_idx" ON "Question"("topicId", "isPublished");
CREATE INDEX "Question_examYear_examSession_idx" ON "Question"("examYear", "examSession");
CREATE INDEX "Flashcard_isPublished_programId_courseId_idx" ON "Flashcard"("isPublished", "programId", "courseId");
CREATE INDEX "Flashcard_topicId_isPublished_idx" ON "Flashcard"("topicId", "isPublished");
CREATE INDEX "FlashcardReview_userId_nextDueAt_idx" ON "FlashcardReview"("userId", "nextDueAt");
CREATE INDEX "FlashcardReview_flashcardId_idx" ON "FlashcardReview"("flashcardId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FlashcardReview" ADD CONSTRAINT "FlashcardReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FlashcardReview" ADD CONSTRAINT "FlashcardReview_flashcardId_fkey" FOREIGN KEY ("flashcardId") REFERENCES "Flashcard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
