# Milestone 6 — Practice and Assessment

**Status:** Authenticated assessment catalog, scoped past-question filtering, timed/untimed test attempts, autosaved answers, automatic grading, corrections, attempt history, and spaced-repetition flashcards are implemented. The schema migrations are applied to the configured database.

## Delivered

- Authenticated Practice overview with real available-test counts, completion metrics, average score, recent activity, and course filters.
- Authenticated, enrollment-scoped past-question browsing with text, course, topic, difficulty, exam-year, and question-type filters. Correct answers remain private until submission.
- Published assessment detail and timed/untimed session setup.
- Persisted user-owned attempts with autosaved objective/written answers, stable shuffled order, server-enforced deadlines, and automatic submission on expiry.
- In-progress sessions can be resumed from the Practice overview; starting the same test reuses an active attempt rather than duplicating it.
- Server-side single-choice, multiple-choice, and true/false grading; short answers are exact-match only when an expected answer exists.
- Result corrections and explanation snapshots. Written responses that cannot be graded objectively remain marked as awaiting review.
- Attempt history and direct result review.
- Flashcard model and per-user rating schedule (Again/Hard/Good/Easy), due-card filtering, and review UI.
- Question exam-year/session and topic metadata; snapshots retain question wording, options, expected answer, explanation, marking guidance, and marks for historical review.
- Authenticated, student-scoped API module and shared Practice contracts.

## Product/data limitations

- Question sets and flashcards require published content from the Admin/content workflow; no fabricated sample assessment data was seeded.
- Theory answers and unrecognized short answers are not auto-graded. They are explicitly marked as awaiting manual review; the moderation/marking workflow belongs with the Admin platform.
- Short-answer automatic marking currently supports a normalized exact-text match, not semantic grading.
- Flashcard review scheduling uses a lightweight rating-based interval rather than a configurable SM-2 schedule.
- Past-question browsing exposes question content and response choices, while persisted attempts are created from published tests. A standalone ad-hoc question-set builder is not included.

## Migrations

- `20261126210000_practice_foundation`
- `20261126220000_practice_attempt_snapshots`

Both migrations have been deployed to the configured database; Prisma reports the schema is up to date.

## Validation

- Prisma schema validation passes.
- Shared, API, and web TypeScript checks pass.
- NestJS API production build passes.
- Next.js production build passes and includes all Practice routes.
