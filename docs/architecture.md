# Visora Architecture

Visora is a pnpm monorepo containing a Next.js web application and a NestJS API.

- `apps/web`: browser-facing application using the Next.js App Router
- `apps/api`: HTTP API organized by NestJS modules
- `packages/shared`: reusable TypeScript types and utilities
- `prisma`: database schema and seed logic

The web app and API communicate through documented HTTP contracts. Shared types should live in `packages/shared` rather than being duplicated across applications.
