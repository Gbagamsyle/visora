# Milestone 5 — Learning Experience

**Status:** Learning overview, course/topic browsing, material detail, saved resources, reading history, material search, and link submission workflow implemented. The learning activity migration is applied to the configured database.

## Delivered

- Authenticated `GET /learning/me` returns current-semester offerings, active topics, approved course resources, saved items, recent reading, and the student's submission statuses.
- Authenticated course detail reads enforce that the course belongs to the student's active academic level and latest active semester.
- Authenticated material detail and search are scoped to the student's active university, program, and current course offerings; pending/rejected/unrelated materials are excluded.
- Course search and filters for all, recently opened, and courses with saved resources.
- Material title, description, course-code, and topic search.
- Persisted per-student save/unsave and recent-reading history.
- Student-submitted external resource links enter `PENDING_REVIEW`; submissions display approval/rejection status and reviewer feedback.
- Responsive course/topic/material pages, loading, retry/error, and empty states.
- Shared TypeScript contracts in `packages/shared` for learning request/response data.
- Prisma migration: `20261126180000_learning_activity`.

## Not delivered / dependencies

- Direct file uploads and in-app PDF/document viewing require an approved object-storage configuration; current submissions accept HTTP(S) links and open external resources in a new tab.
- Admin moderation screens/workflow are part of the Admin milestone; submitted materials remain pending until an administrator changes their status.
- The migration has been applied to the database configured by the workspace root `.env` file.
- Automated API integration tests and seeded course/topic/material records remain necessary for end-to-end verification.

## Validation

- Prisma schema validation passes.
- Configured database reports all migrations applied.
- API TypeScript check passes.
- Web TypeScript check passes.
- API production build passes.
- Web production build passes, including the new dynamic course and material routes.
