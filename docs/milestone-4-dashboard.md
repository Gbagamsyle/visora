# Milestone 4 — Student Dashboard

**Status:** Dashboard foundation implemented; authenticated student data is served by NestJS.

## Delivered

- Clerk-authenticated `GET /dashboard/me` endpoint
- Student identity and active academic enrollment
- Current-level course offerings for the latest active semester
- Approved programme learning materials
- Published programme/global practice test count
- Completed practice attempt count and average score
- Unread notification count
- University/global announcements
- Recent posts by students enrolled at the same university
- Dashboard loading, retry/error, and incomplete-onboarding states
- Responsive metric cards, courses, materials, practice entry, announcements, and community sections

## Data-model limitations

The current schema does not record per-student course completion, recent reading history, or calendar events/reminders. The dashboard avoids invented progress and reminder values; those sections should be added when corresponding persistence models and product behavior are defined.

## Validation

- API typecheck passes
- Web typecheck passes
- Dashboard API route is registered and returns `401` without a valid Clerk session
- Web `/home` route compiles and returns `200`
