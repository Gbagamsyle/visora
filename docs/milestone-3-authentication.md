# Milestone 3 — Authentication and Onboarding

**Status:** Implementation complete; credential and database configuration required for live use.

## Delivered

### Clerk web integration

- Clerk provider added to the Next.js root layout
- Middleware protects student-only routes
- Login and registration pages use Clerk components
- Sign-in and sign-up redirect to onboarding

### Onboarding

- University, programme, and academic-level cascading selection
- Optional display name, phone number, and matriculation number
- Local Clerk user provisioning before onboarding
- API submission with the Clerk bearer session

### NestJS API

- Global configuration module
- Prisma service
- Clerk bearer-token verification guard
- Authenticated request context decorator
- User provisioning endpoint
- Current-user endpoint
- Onboarding endpoint
- Academic lookup endpoints
- Development CORS configuration

### Cross-record safeguards

- Active university validation
- Programme belongs to selected university
- Academic level belongs to selected programme
- Student profile upsert
- Active student enrollment upsert
- Student role assignment

## Remaining environment setup

Set real values in the local environment:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_API_URL`
- `WEB_ORIGIN`

Then run:

```sh
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

## Production boundary

Clerk webhooks are not implemented by this milestone. Local database provisioning currently occurs through the authenticated `/users/provision` API call. A production setup should also add an idempotent Clerk webhook for account lifecycle synchronization and a duplicate provisioning protection strategy.
