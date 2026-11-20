# Visora workspace

- Use pnpm workspaces: apps/web, apps/api, and packages/shared.
- Keep web code in the Next.js App Router structure and API code in NestJS modules.
- Share cross-package TypeScript types through packages/shared.
- Use TypeScript for all source code and Prisma for database access.
