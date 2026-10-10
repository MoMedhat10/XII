# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

XII is a luxury watch e-commerce app on **Next.js 16 (App Router)**, React 19, Tailwind CSS v4, Prisma 7 + PostgreSQL, and Redis. The bundled Next.js docs live in `node_modules/next/dist/docs/` (`01-app`, `03-architecture`, …), so check them before using a Next.js API.

## Commands

```bash
npm run dev          # next dev (localhost:3000)
npm run build        # next build
npm run lint         # eslint (flat config in eslint.config.mjs)
npm run typecheck    # tsc --noEmit
npm run format       # prettier on all .ts/.tsx (with tailwind class sorting)

npx prisma migrate dev --name <name>   # create + apply a migration, regenerates the client
npx prisma generate                    # regenerate the client only
npx prisma db seed                     # runs `tsx prisma/seed.ts` (configured in prisma.config.ts)
npx prisma studio
```

There is no test framework set up yet.

Environment variables (`.env`, loaded by `prisma.config.ts` via `dotenv/config`): `DATABASE_URL`, `REDIS_URL`, `RESEND_API_KEY`, `CRON_SECRET`, and optionally `LOG_LEVEL`.

## Architecture

### What exists vs. what's planned
`README.md` and `implementation_plan.md` describe the full storefront (catalog, product pages at `/timepieces/[slug]`, finder, compare, cart, …). **Most of it isn't built yet.** What exists now is the auth system, a placeholder `(dashboard)/dashboard` page, the home page, and the Prisma schema, which already models the commerce domain (`Brand`, `Watch`, `WatchImage`, `FavoriteWatch`, `Cart`/`CartItem`, `Order`/`OrderItem`).

### Shared server singletons live in the root `lib/`, not `src/lib/`
- `lib/prisma.ts`: a `PrismaClient` using the `@prisma/adapter-pg` driver adapter, cached on `global` in dev.
- `lib/redis.ts`: a node-redis client, cached on `globalThis`. Always get it with `await getRedis()`, which connects lazily.
- `lib/pino.ts`: the `logger` (uses pino-pretty in development). Use it instead of `console`.

The `@/*` alias maps to `src/*`, so these files are imported by relative path (e.g. `../../../../lib/prisma`). `src/lib/utils.ts` (`cn`) is the shadcn utility.

The Prisma client is generated to `src/app/generated/prisma`, which is gitignored. Import types from `@/app/generated/prisma/client` and never edit the generated files. `PRISMA_WORKFLOW.md` has the full Prisma workflow.

### Auth (`src/app/(auth)/`)
Custom session auth built without an auth library. Everything sits inside the route group:
- `_actions/index.ts` (register, login, email verification, resend, logout) and `_actions/password.ts` (forgot/reset password flow) are `"use server"` actions. Each one returns `{ success, message, data? }` and catches every error rather than throwing to the client.
- `_utils/` holds the data-access and helper layer the actions call: `user`, `session`, `verificationCode`, `passwordResetSession`, `OTP`, `email` (Resend), `templates`, `schema` (zod schemas + inferred input types), `rateLimit`.
- Forms in `src/components/auth/*` use react-hook-form with the zod schemas from `_utils/schema.ts` and call the server actions directly.

How it works:
- **Sessions**: a random 32-byte hex id is stored in the `Session` table and set as the httpOnly cookie `xii_session` (7 days, or 30 with "remember me"). `getCurrentUser()` in `_utils/session.ts` resolves the cookie to a user and deletes the session if it has expired.
- **OTPs**: 6-digit codes. Only the SHA-256 hash is stored in `VerificationCode` (typed by `VerificationCodeType`), and codes expire after 10 minutes. Login is blocked until `emailVerifiedAt` is set.
- **Password reset**: after the OTP step, a `PasswordResetSession` (10 min, cookie `reset_password_session`) carries the user through the verify → reset pages.
- **Rate limiting**: `_utils/rateLimit.ts` runs an atomic fixed-window counter in Redis through a Lua script. Keys look like `register:user:<email>` and `otp:email-verification:<userId>`. There are two modes, and the choice is deliberate:
  - `rateLimitOrThrow` **fails closed**. It throws `ServiceUnavailableError` if Redis is down, and the action surfaces that error's message.
  - `rateLimit` wrapped in its own try/catch **fails open**. Login uses this so a Redis outage doesn't lock users out.
- **Cron**: `(auth)/api/cron/cleanup/route.ts` deletes expired verification codes. Vercel calls it hourly (`vercel.json`), and it requires `Authorization: Bearer $CRON_SECRET`.

## UI conventions
- The UI uses shadcn/ui (style `radix-lyra`, built on the `radix-ui` package). Primitives are in `src/components/ui/`, and new ones are added via the shadcn CLI per `components.json`. Theming uses `next-themes`, and toasts use `sonner`.
- The design system is in `DESIGN.md`: architectural brutalism with heavy solid borders, **0px border radius**, no shadows or blurs, black/white/concrete/steel palette, Luxury Gold `#B08D57` as the accent, and Space Grotesk (display) + IBM Plex Sans (body). Theme tokens are defined in `src/app/globals.css` (Tailwind v4, so there is no tailwind.config).
- Prettier is configured with no semicolons, double quotes, es5 trailing commas, and Tailwind class sorting that also covers `cn`/`cva`.
