-- AlterTable
ALTER TABLE "AttemptAnswer"
    ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "marksSnapshot" DOUBLE PRECISION;

-- Preserve the existing answer order for historical rows before enforcing unique positions.
WITH ranked_answers AS (
    SELECT "id", ROW_NUMBER() OVER (PARTITION BY "attemptId" ORDER BY "createdAt", "id") - 1 AS position
    FROM "AttemptAnswer"
)
UPDATE "AttemptAnswer" AS answers
SET "position" = ranked_answers.position
FROM ranked_answers
WHERE answers."id" = ranked_answers."id";

-- CreateIndex
CREATE UNIQUE INDEX "AttemptAnswer_attemptId_position_key" ON "AttemptAnswer"("attemptId", "position");
