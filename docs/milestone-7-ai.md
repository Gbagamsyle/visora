# Milestone 7 — Visora AI

**Status:** Implemented as an authenticated, enrollment-aware conversational study companion with persisted conversation history, approved-material citations, provider fallback, and clear limitations.

## Delivered

- Authenticated AI API guarded by Clerk sessions.
- User-owned conversation creation, history retrieval, detail retrieval, and deletion.
- Persisted user and assistant messages with citation snapshots and response status.
- Student academic context including university, program, level, semester, and current courses.
- Enrollment-scoped citations sourced only from approved learning materials.
- OpenAI-compatible provider integration through `AI_API_URL`, `AI_API_KEY`, and `AI_MODEL`.
- Limited mode with a useful response when no AI provider is configured.
- Error mode with a retry-safe response and provider error status persisted separately.
- New-chat, conversation history reload, delete, message composer, loading, error, source, and sending states in the Next.js UI.
- Shared AI TypeScript contracts in `packages/shared`.

## Setup

### 1. Configure the database

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to an accessible PostgreSQL/Neon database.
3. Generate the Prisma client:

   ```powershell
   pnpm db:generate
   ```

4. Apply migrations:

   ```powershell
   pnpm db:migrate
   ```

   The Milestone 7 migration is `prisma/migrations/20261128120000_ai_conversations`. It creates `AiConversation` and `AiMessage` plus their user/conversation relationships and indexes.

### 2. Configure Clerk

Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and the Clerk redirect variables in `.env`. The AI API requires a valid Clerk bearer token and an existing Visora student account. Academic onboarding is also required for course-specific context.

### 3. Configure an AI provider

Visora AI expects an OpenAI-compatible chat-completions endpoint. Gemini can be configured through Google's OpenAI-compatible endpoint:

```dotenv
AI_API_URL="https://generativelanguage.googleapis.com/v1beta/openai"
AI_API_KEY="replace-with-your-Gemini-api-key"
AI_MODEL="gemini-3.5-flash"
```

- `AI_API_URL` is Gemini's OpenAI-compatible base URL. The application appends `/chat/completions`.
- `AI_API_KEY` is kept only in API/server environment variables and must not use a `NEXT_PUBLIC_` prefix.
- `AI_MODEL` is the Gemini model name. `gemini-3.5-flash` is a suitable default subject to Google's current availability and regional limits.

Gemini free-tier quotas may change or be unavailable in some regions. The API key is secret server configuration and should never be committed or placed in `NEXT_PUBLIC_*` variables.

Restart the NestJS API after changing these values.

### 4. Start the applications

In separate terminals, run:

```powershell
pnpm dev:api
pnpm dev:web
```

The API listens on `PORT` (default `3001`) and the web application uses `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`). Open `/ai` after signing in and completing onboarding.

### 5. Database migration on a hosted environment

For an existing hosted database, use Prisma's migration deploy command:

```powershell
pnpm prisma migrate deploy
```

Confirm that `DATABASE_URL` points to the deployed database and that the migration host can reach PostgreSQL on port `5432`.

## Provider behavior

The provider receives the student's active academic context, the titles of approved learning materials, and the most recent conversation messages. It does not receive material file contents or database credentials.

When `AI_API_URL` or `AI_API_KEY` is omitted, Visora AI remains usable in a clearly identified limited mode and does not invent a live model answer. If the provider rejects a request or is unavailable, the response uses an error fallback and the status is persisted with the assistant message.

## Product limitations

- Citations identify approved learning materials but do not prove that provider generation used one particular source passage.
- The provider integration uses chat completions and does not upload or embed material content. It sends only academic context and material metadata.
- Clinical and academic answers must be verified against approved course materials and staff guidance.
- Conversation history is student-owned and can be deleted, but no export or transcript sharing workflow is included.
- Context-aware support is limited to the user's active semester and approved materials available under that enrollment.

## Troubleshooting

- **AI remains in limited mode:** verify that both `AI_API_URL` and `AI_API_KEY` are set in the API environment, then restart `pnpm dev:api`.
- **Provider request fails:** confirm the URL is an API base URL, not a browser chat page. The API appends `/chat/completions`; verify the model name and key permissions.
- **Course context is missing:** complete Clerk account provisioning and active academic onboarding.
- **401 authentication error:** sign in again, then verify `CLERK_SECRET_KEY` and the web/API session configuration.
- **Database migration fails with `P1001`:** confirm `DATABASE_URL`, Neon database availability, network access, and PostgreSQL port `5432`.
- **Database tables are missing:** run `pnpm db:generate` and `pnpm db:migrate` after database connectivity is restored.

## Validation

- Prisma schema validation passed.
- Shared, admin, web, and API TypeScript checks pass.
- NestJS API and Next.js applications build successfully.
- Prisma Client generation succeeds after stale Node processes are stopped.
- The AI migration file is ready; apply `20261128120000_ai_conversations` when database connectivity is restored.

- The `20261128120000_ai_conversations` migration has been deployed successfully with Prisma migrate deploy.
- `prisma migrate status` confirms the database schema is up to date.
