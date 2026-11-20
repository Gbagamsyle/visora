# Database Design

Visora uses PostgreSQL with Prisma. The initial schema separates reusable courses from course offerings and keeps the question bank independent from assessments.

## Core domains

- **Identity:** Clerk-backed users, profiles, roles, and user-role assignments
- **Academics:** universities, programs, levels, semesters, courses, offerings, and student enrollments
- **Learning:** topics and moderated learning materials
- **Assessments:** reusable questions, tests, attempts, answers, and option selections
- **Community:** posts, media, comments, reactions, saves, follows, and reports
- **Administration:** announcements, notifications, moderation actions, and audit logs

## Access rules

- A student must have one active student enrollment record.
- Learning materials are scoped by university and program and may optionally target a course or topic.
- Global questions have no university assignment; university questions require a university assignment.
- Course offerings must connect a course, academic level, and semester within the same academic hierarchy.
- Selected assessment options must belong to the question in the attempt answer.

Some cross-record rules require application or PostgreSQL enforcement because Prisma relations alone cannot compare fields across associated records.

## Migration workflow

Set `DATABASE_URL` before database operations:

```sh
cp .env.example .env
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## PostgreSQL integrity constraints

The first migration should add a check constraint for question scope:

```sql
ALTER TABLE "Question"
ADD CONSTRAINT "question_scope_university_check"
CHECK (
  ("scope" = 'GLOBAL' AND "universityId" IS NULL)
  OR
  ("scope" = 'UNIVERSITY' AND "universityId" IS NOT NULL)
);
```

Application services must additionally verify university/program/level hierarchy consistency, learning-material course ownership, and assessment option ownership.

## Seeding

The seed currently creates the base role values:

- `STUDENT`
- `MODERATOR`
- `CONTENT_ADMIN`
- `SUPER_ADMIN`

Universities, programs, levels, semesters, courses, and academic offerings should be entered as verified database records through administration rather than hardcoded for one institution.
