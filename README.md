# XII — The Luxury Timepiece Archive

A full-stack luxury watch store with an architectural brutalist design: heavy 4px borders, square corners, a black, white and concrete palette, and one gold accent.

**Live demo: [xii.quest](https://xii.quest)**

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 7 + PostgreSQL · Redis · Upstash QStash · Resend · Vercel

> **Demo checkout:** no real payment is taken. Any card number that passes the standard Luhn check works (for example `4242 4242 4242 4242`, with any future expiry date and any CVC). The card `4000 0000 0000 0002` is always declined, so you can try the error path. Card details are validated and then discarded; they're never stored or logged.

---

## Contents

- [Overview](#overview)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Routes](#routes)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Deployment (free, on Vercel)](#deployment-free-on-vercel)
- [Roadmap](#roadmap)
- [Design system](#design-system)

---

## Overview

XII presents watches like exhibits in a gallery rather than products on a shelf. Behind the editorial look is a complete store:

- customers browse, save, compare, buy and track orders
- accounts are verified by email
- an admin dashboard runs the catalog, customers and orders
- emails are sent by a background-job queue with retries

Everything runs on free tiers.

---

## Features

### Storefront

- **Home:** hero, a curated drop of featured watches, an interactive wrist size guide, a watch anatomy section, collector stories and a call to action.
- **Catalog** (`/watches`):
  - Search, brand filter, price range slider, and four sorts: newest, price low to high, price high to low, A–Z.
  - Loads 12 watches at a time with a "Load more" button.
  - Every filter lives in the URL, so a filtered view can be shared or bookmarked.
- **Watch page:** image gallery, buy panel (add to bag, save to wishlist), full specs (movement, caliber, case material, condition), and a breadcrumb back to the brand.
- **Wishlist:** heart any watch. On the wishlist, select several to remove at once, or add a watch to the bag.
- **Compare:** up to **4** watches side by side.
- **Bag:** up to **5** of each watch, limited by stock. "Save for later" moves a watch to the wishlist.
- **Checkout:** shipping details and simulated card payment.
  - Each checkout carries a unique key, so a double click or a retried request returns the same order instead of creating a second one.
  - Prices and stock are re-checked when the order is placed.
- **Orders:** history with a status filter, and a detail page with a status track (Paid → Shipped → Delivered). An order can be cancelled while it's still Paid.
- **Order emails:** confirmed, shipped (with the shipment number), cancelled.

### Accounts

- **Register, then verify by email:** a 6-digit code that expires after 10 minutes. Only a SHA-256 hash of the code is stored.
- **Login** with "remember me": 7-day or 30-day sessions in an httpOnly cookie.
- **Forgot password:** an emailed code, then a short reset session.
- **Rate limiting** in Redis:
  - Sign-up, codes and checkout **fail closed**: they're refused if Redis is down.
  - Login **fails open**, so a Redis outage doesn't lock anyone out.
- **Suspended accounts** can't log in, and their sessions stop working.

### Admin dashboard (`/dashboard`)

- **Overview** for the last 7, 30 or 90 days, with charts:
  - Revenue (cancelled orders excluded) and orders, compared with the previous period.
  - New customers, orders waiting to ship, sold-out and low-stock watches.
  - Top sellers by watch and brand, the most-wanted watches, recent orders and sign-ups.
- **Watches and brands:**
  - Create, edit, publish, unpublish and delete.
  - Images upload straight from the browser to storage with presigned URLs, are checked on the server, and can be reordered.
  - A watch that has orders can't be deleted, only unpublished.
- **Users:** search and filter, mark an email verified, suspend, sign out everywhere, delete. A deleted customer's orders are kept.
- **Orders:**
  - Ship: enter a carrier's tracking number, or let XII generate a shipment number.
  - Mark delivered.
  - Cancel, which puts the stock back.

Every status change is a compare-and-swap, so a customer and an admin can never both win the same change.

### Platform

- **Background jobs** (Upstash QStash):
  - Order emails and failed storage deletes are queued and retried up to 5 times.
  - Job requests are signature-checked, and jobs that use up their retries are logged.
  - If QStash is unreachable, the job runs right away instead, so nothing is lost.
- **Daily cron jobs:** delete expired verification codes, and delete abandoned uploads older than 24 hours.
- **Shared customer layout:** sticky header with a bag count, account menu, mobile menu, a minimal header during checkout, and a "skip to content" link.

---

## Tech stack

| Area | Choice | Used for |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | Server Components, server actions, route handlers, `after()` |
| UI | React 19, Tailwind CSS v4, shadcn/ui (Radix) | Components and the brutalist theme tokens in `globals.css` |
| Client data | TanStack Query | Admin dashboard reads and writes, catalog infinite list |
| Forms and validation | react-hook-form + zod | Every form and every server input |
| Database | PostgreSQL ([Prisma Postgres](https://www.prisma.io/postgres)) + Prisma 7 | `@prisma/adapter-pg` driver adapter |
| Cache and rate limits | Redis ([Upstash](https://upstash.com)) | Fixed-window limiter (an atomic Lua script) |
| File storage | S3-compatible ([Supabase Storage](https://supabase.com/storage)) | Watch images and brand logos (presigned uploads) |
| Email | [Resend](https://resend.com) | Verification codes, password reset, order emails |
| Background jobs | [Upstash QStash](https://upstash.com/docs/qstash) | Retried email and storage jobs |
| Logging | pino | Structured logs (pretty in development) |
| Charts | recharts (shadcn `chart`) | Admin overview |
| Hosting | Vercel | Functions, cron jobs, custom domain |

---

## Architecture

```mermaid
flowchart LR
  B["Browser"] --> N["Next.js 16 on Vercel<br/>pages · server actions · API routes"]
  B -- "presigned image upload" --> S[("S3 storage<br/>Supabase")]
  N --> P[("PostgreSQL<br/>Prisma Postgres")]
  N --> R[("Redis<br/>Upstash")]
  N --> S
  N -- "publish job" --> Q["Upstash QStash"]
  Q -- "signed POST /api/jobs" --> N
  N --> E["Resend<br/>email"]
  C["Vercel Cron"] -- "Bearer CRON_SECRET" --> N
```

Design rules used throughout:

- **Money** is stored as integer USD cents (`priceCents`, `totalCents`), never as floats.
- **Orders only move forward:** PAID → SHIPPED → DELIVERED, or PAID → CANCELLED. Every change is an `updateMany` with the expected status in `where`. Cancelling restocks in the same transaction.
- **Orders outlive their sources.** Each order item keeps a snapshot of the watch's name, model, brand and cover image, so deleting or editing a watch never changes past orders.
- **Server-to-client data** is always mapped to plain objects, never raw Prisma rows. User data goes through a public select that leaves out the password hash.
- **Admin pages** read through API routes with TanStack Query and write through server actions. Filters live in the URL.
- **Jobs are queued after the transaction commits**, never inside it, so a rolled-back change never sends an email.

More detail: [CLAUDE.md](CLAUDE.md) (architecture notes), [DESIGN.md](DESIGN.md) (design system), [PRISMA_WORKFLOW.md](PRISMA_WORKFLOW.md) (database workflow).

---

## Routes

### Storefront routes

| Route | Page |
| --- | --- |
| `/` | Home |
| `/watches` | Catalog |
| `/watches/[id]` | Watch page |
| `/compare` | Compare (`?ids=…`) |
| `/wishlist` | Wishlist (sign-in required) |
| `/cart` | Bag (sign-in required) |
| `/checkout` | Checkout (sign-in required) |
| `/orders`, `/orders/[id]` | Order history and detail (sign-in required) |

### Account routes

| Route | Page |
| --- | --- |
| `/register`, `/verify-email` | Sign up and email code |
| `/login` | Sign in |
| `/forgot-password`, `/forgot-password/verify-email`, `/reset-password` | Password reset |

### Admin routes (ADMIN role only)

| Route | Page |
| --- | --- |
| `/dashboard` | Overview (`?range=7\|30\|90`) |
| `/dashboard/watches` | Watches and brands |
| `/dashboard/users` | Customers |
| `/dashboard/orders` | Orders |

### API routes

| Route | Purpose |
| --- | --- |
| `/api/catalog`, `/api/catalog/facets` | Catalog results and filter options |
| `/api/favorites` | The signed-in user's saved watches |
| `/api/admin/*` | Admin reads (watches, brands, users, orders, overview) |
| `/api/jobs`, `/api/jobs/failed` | QStash job delivery and dead-letter callback (signature required) |
| `/api/cron/cleanup`, `/api/cron/storage-cleanup` | Daily cron jobs (`CRON_SECRET` required) |

---

## Project structure

```text
XII/
├── lib/                      # Server-only singletons and helpers (imported by relative path)
│   ├── prisma.ts             # PrismaClient on a small pg pool
│   ├── redis.ts              # node-redis client (getRedis())
│   ├── jobs.ts               # QStash jobs: enqueue, publishJob, runJob
│   ├── qstash-auth.ts        # Signature check for /api/jobs
│   ├── app-url.ts            # Public site URL (APP_URL or Vercel's domain)
│   ├── storage.ts            # S3 client, presigned uploads, deletes
│   ├── order-stock.ts        # Restock on cancel
│   ├── order-snapshot.ts     # Copy a watch into an order item
│   ├── tracking-number.ts    # XII shipment numbers
│   ├── email-from.ts, cron-auth.ts, pino.ts
├── prisma/
│   ├── schema.prisma         # Users, sessions, brands, watches, carts, orders, …
│   ├── migrations/
│   └── seed*.ts              # Sample data scripts
├── src/
│   ├── app/
│   │   ├── (app)/            # Storefront: home, watches, compare, wishlist, cart, checkout, orders
│   │   ├── (auth)/           # Login, register, email codes, password reset, cleanup cron
│   │   ├── (dashboard)/      # Admin dashboard and its API routes
│   │   ├── api/jobs/         # QStash delivery endpoints
│   │   ├── generated/prisma/ # Generated Prisma client (gitignored)
│   │   ├── layout.tsx, globals.css, not-found.tsx
│   ├── components/           # UI by feature: layout, home, watches, watch, cart, checkout,
│   │                         # orders, wishlist, compare, auth, dashboard, ui (shadcn)
│   ├── hooks/, lib/          # Client hooks, cn(), money formatting, upload client
├── vercel.json               # Cron schedules
├── .env.example              # Every environment variable, documented
└── DESIGN.md, CLAUDE.md, PRISMA_WORKFLOW.md
```

Inside each route, code lives in private folders that Next.js never turns into routes:

| Folder | Holds |
| --- | --- |
| `_actions` | Server actions |
| `_data` | Data access and the plain objects (DTOs) sent to the client |
| `_hooks` | Client hooks |
| `_utils` | Schemas and helpers |
| `_server` | Server-only helpers |

---

## Getting started

### Prerequisites

- **Node.js 24**
- **PostgreSQL:** local, or a free [Prisma Postgres](https://www.prisma.io/postgres) database
- **Redis:** local, or a free [Upstash](https://upstash.com) database
- **An S3-compatible bucket** (for example Supabase Storage) with a public read URL
- **A [Resend](https://resend.com) API key**
- *Optional:* QStash. Without it, jobs run right away with no retries.

### Setup

```bash
git clone https://github.com/MoMedhat10/XII.git
cd XII
npm install                 # also generates the Prisma client (postinstall)
cp .env.example .env        # then fill in your values
npx prisma migrate dev      # create the tables
npm run dev                 # http://localhost:3000
```

**Optional sample data:**

```bash
npm run seed:users          # 24 sample customers (@seed.xii.test) with orders, carts and wishlists
npm run seed:users -- --clear
npm run seed:orders -- you@example.com   # 6 sample orders for one account
```

`seed:users` needs a few published watches first. Seeded accounts can't sign in.

**Become an admin:**

1. Register and verify your email on the site.
2. Run `npx prisma studio`, open `User`, and set your `role` to `ADMIN`.
3. Sign in again; the account menu then shows **Admin dashboard**.

**Local background jobs (optional):**

```bash
npx @upstash/qstash-cli dev   # prints a local QSTASH_URL, token and signing keys for .env
```

After every `prisma migrate dev`, run `npx prisma generate` as well.

---

## Environment variables

All of them are documented in [`.env.example`](.env.example).

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL URL. Use `sslmode=verify-full`. On Vercel use the **pooled** host (see below). |
| `REDIS_URL` | yes | Redis URL (`rediss://…` for Upstash) |
| `APP_URL` | locally | Public site URL for email links and QStash callbacks. Optional on Vercel, which provides the production domain. |
| `RESEND_API_KEY` | yes | Resend API key |
| `EMAIL_FROM` | for real users | Sender on a domain verified in Resend, e.g. `XII <no-reply@mail.yourdomain.com>`. Unset, Resend's test sender only delivers to your own Resend account address. |
| `CRON_SECRET` | yes | Bearer token for the cron routes (`openssl rand -hex 32`) |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET` | yes | S3-compatible storage |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | yes | Storage credentials |
| `S3_PUBLIC_URL` | yes | Public base URL for stored images (the build fails without it) |
| `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY` | for retries | QStash credentials. Without a token, jobs run right away. |
| `QSTASH_URL` | with QStash | Your region's endpoint (e.g. `https://qstash-eu-central-1.upstash.io`), or the local dev server's URL |
| `LOG_LEVEL` | no | `debug` in development, `info` in production by default |

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3000 |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier, with Tailwind class sorting |
| `npm run seed:users` | Sample customers (`-- --clear` removes them) |
| `npm run seed:orders -- <email>` | Sample orders for one account |
| `npx prisma migrate dev --name <name>` | Create and apply a migration (development) |
| `npx prisma migrate deploy` | Apply pending migrations (production) |
| `npx prisma generate` | Regenerate the client |
| `npx prisma studio` | Browse and edit data |

There is no test suite yet.

---

## Deployment (free, on Vercel)

The live site runs entirely on free tiers:

| Need | Service |
| --- | --- |
| Hosting, functions, cron | Vercel Hobby (personal, non-commercial use) |
| Database | Prisma Postgres |
| Redis and background jobs | Upstash Redis and QStash |
| Images | Supabase Storage |
| Email | Resend (free plan) |

A custom domain is the only paid item, and it's optional.

### Steps

1. **Create the services** above, ideally all in the same region (for example Frankfurt / `eu-central-1`).
2. **Import the repo into Vercel.** Don't add Vercel's suggested integrations: they create new, empty resources and replace your variables.
3. **Add the environment variables before the first deploy.** The build needs `S3_PUBLIC_URL`. In production:
   - **`DATABASE_URL` must use the pooled host:**
     `postgres://USER:KEY@pooled.db.prisma.io:5432/postgres?sslmode=verify-full`
     Keep the direct `db.prisma.io` host for local work and migrations.
   - **Leave `APP_URL` unset.** The app uses Vercel's real production domain. Never guess `<name>.vercel.app`: that name may belong to someone else's project.
   - **Set `QSTASH_URL` to your region's endpoint,** never the local dev server URL.
4. **Apply migrations** from your machine: `DATABASE_URL="<direct url>" npx prisma migrate deploy`.
5. **Deploy.** `postinstall` generates the Prisma client during the build.
6. **Set Function Region** (Settings → Functions) next to your database.
7. **Crons:** on the Hobby plan, cron jobs run at most once a day, so both schedules in `vercel.json` are daily.

### Custom domain and email

1. Add the domain in Vercel (Settings → Domains).
2. In Resend, add a sending subdomain (e.g. `mail.yourdomain.com`) and copy its DNS records into your DNS provider. In Vercel DNS, enter record names without the domain part.
3. Add a DMARC record: `TXT` named `_dmarc` with the value `v=DMARC1; p=none;`.
4. Set `EMAIL_FROM="XII <no-reply@mail.yourdomain.com>"` and redeploy. Without a verified domain, emails only reach the Resend account owner, so nobody else can register.

### Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| No emails; QStash logs show **404** for `/api/jobs` | Jobs go to the wrong domain. Remove `APP_URL` (or set your real domain) and redeploy. The logs warn when `APP_URL` doesn't match. |
| `P2037 Too many database connections` | Use the **pooled** database host on Vercel. |
| `SECURITY WARNING: The SSL modes 'prefer', 'require'…` | Use `sslmode=verify-full` in `DATABASE_URL`. |
| Emails only reach you | Verify a domain in Resend and set `EMAIL_FROM`. |
| Deploy rejected over a cron schedule | Hobby crons can run at most once a day. |
| Build fails: `S3_PUBLIC_URL is not set` | Add the variables before deploying. |

---

## Roadmap

Ideas from the original concept that aren't built yet:

- Watch finder quiz (style, wrist size, budget → recommendations)
- Jeweler's loupe zoom on watch images
- "Listen to the caliber" movement audio
- Journal / editorial articles
- Multi-currency prices
- Real payments (for example Stripe) in place of the simulated checkout
- Automated tests

---

## Design system

Architectural brutalism:

- **Borders and shape:** heavy solid borders, **0px radius** everywhere, no shadows or blurs.
- **Palette:** black, white, concrete (`#D9D9D9`) and steel (`#A5A5A5`), with **Luxury Gold `#B08D57`** reserved for prices, highlights and active states.
- **Type:** Space Grotesk for display, IBM Plex Sans for body text.

Theme tokens live in `src/app/globals.css`, and the full guidelines are in [DESIGN.md](DESIGN.md).
