# XII: fix plan for the high-priority schema issues

> **How to use:** paste this whole file into Claude Code at the root of the `XII` repo. It is written as instructions for Claude Code. It covers issues 2.1 to 2.5 from `db-schema-review.md`. Read the "Decisions" section first and change anything you disagree with before you send it.

---

## Context for Claude Code

- Stack: Next.js 16 (App Router), React 19, Prisma 7 (`prisma-client` generator, output `src/app/generated/prisma`, `@prisma/adapter-pg`), PostgreSQL. Read `CLAUDE.md` and `AGENTS.md` first. (`CLAUDE.md` mentions a `PRISMA_WORKFLOW.md`, but that file isn't in the repo.) Per `AGENTS.md`, check `node_modules/next/dist/docs/` before using any Next.js API.
- Schema: `prisma/schema.prisma`. Migrations: `prisma/migrations/`. Prisma client singleton: `lib/prisma.ts`.
- Auth code that touches `User`: `src/app/(auth)/_actions/index.ts`, `src/app/(auth)/_actions/password.ts`, `src/app/(auth)/_utils/user.ts`, `src/app/(auth)/_utils/session.ts`, `src/app/(auth)/_utils/schema.ts`.
- The catalog, cart and order UIs are not built yet, so no app code reads `price`, `total` or `unitPrice` today. That makes the money and delete-rule changes cheap right now.
- Work on a new branch `fix/schema-high-priority`. Make **one commit per step** below, so each step can be reviewed and reverted on its own.
- Use `npx prisma migrate dev --name <name>` for each migration. Where a step says `--create-only`, generate the migration, edit the SQL as described, then run `npx prisma migrate dev` to apply it.
- After every step, run `npm run typecheck` and `npm run lint`.

## Decisions (already made, change them here if you disagree)

| Topic | Decision | Why |
| --- | --- | --- |
| Case-insensitive email/username | PostgreSQL `citext` column type for both `email` and `username` | The database enforces uniqueness no matter what the app code does. Prisma supports it natively with `@db.Citext`. |
| Money storage | Integer minor units (cents): `priceCents Int`, `totalCents Int`, `unitPriceCents Int` | Exact arithmetic, no `Decimal.js` objects, and plain numbers serialise to Client Components. It matches how Stripe works. Single base currency: USD. |
| User deletion vs orders | `Order.userId` becomes optional with `onDelete: SetNull`, and the order snapshots the customer's email | Orders must survive account deletion for accounting. |

---

## Step 1: Normalise email and make email/username case-insensitive (issue 2.1)

**Bug being fixed:** `loginUser` lowercases an email identifier (`_actions/index.ts:121`), but `registerUser` stores the email exactly as typed. A user who registers as `Mo@Gmail.com` can't log in with their email, and `mo@gmail.com` can create a second account.

### 1a. Check existing data first
Before you change the schema, run this against the dev database and **stop and report** if it returns any rows:
```sql
SELECT lower(email), count(*) FROM "User" GROUP BY 1 HAVING count(*) > 1;
SELECT lower(username), count(*) FROM "User" GROUP BY 1 HAVING count(*) > 1;
```
(`npx prisma db execute --stdin` or Prisma Studio.) Duplicates must be resolved by hand before step 1c, or the migration will fail.

### 1b. Normalise in the zod schemas (`src/app/(auth)/_utils/schema.ts`)
- `registerSchema.email`: `z.string().trim().toLowerCase().min(1, …).email(…)`. Keep the existing messages. Put `.trim().toLowerCase()` before the validators.
- `forgotPasswordSchema.email`: same change.
- `registerSchema.username`: add `.trim()` only. Keep the user's chosen casing for display; the database handles case-insensitive uniqueness.
- `loginSchema.identifier`: add `.trim()`. Keep the existing lowercasing in `loginUser`, which now matches what is stored.
- Check with zod 4 that `.toLowerCase()` and `.trim()` are transforms that run before `.email()`. If not, use `z.preprocess` or `z.string().transform(...).pipe(z.email())`.

### 1c. Migration: switch both columns to `citext`
In `prisma/schema.prisma`:
```prisma
model User {
  username String @unique @db.Citext
  email    String @unique @db.Citext
  // ...
}
```
Run `npx prisma migrate dev --create-only --name user_email_username_citext`. Then edit the generated SQL so the extension is created **first**:
```sql
CREATE EXTENSION IF NOT EXISTS citext;
-- then the generated ALTER TABLE "User" ALTER COLUMN "email" SET DATA TYPE CITEXT, ...
```
Also add a one-off normalisation of existing rows, placed before the `ALTER`:
```sql
UPDATE "User" SET email = lower(trim(email));
```
Apply with `npx prisma migrate dev`. Confirm that the existing unique indexes `User_email_key` and `User_username_key` still exist after the type change.

If Prisma 7 needs the extension declared in the schema (`previewFeatures = ["postgresqlExtensions"]` + `extensions = [citext]` on the datasource), do that instead of the hand-written `CREATE EXTENSION`. Check the bundled Prisma skill docs in `.agents/skills/` and pick whichever Prisma 7 supports. Note your choice in the commit message.

### 1d. Fix the duplicate check in `registerUser` (`_actions/index.ts:47-62`)
With `citext`, `findExistingUser("Mo", …)` will now match a stored `mo`. But the JS checks `existingUser.username === username` and `existingUser.email === email` are case-sensitive. They would fall through, and `createUser` would then throw a unique-constraint error (P2002). Compare case-insensitively:
```ts
if (existingUser.username.toLowerCase() === username.toLowerCase()) { … }
if (existingUser.email.toLowerCase() === email.toLowerCase()) { … }
```
Also catch Prisma `P2002` around `createUser` (two concurrent registrations can both pass the check) and return the same "already exists" message instead of the generic error.

### 1e. Acceptance checks
- Register `Test.User@Example.com`, and confirm it is stored as `test.user@example.com`.
- Log in with `TEST.USER@example.com`, and confirm it succeeds once the email is verified.
- Register again with `test.user@EXAMPLE.com`, and confirm "Email already exists".
- Register username `Mohamed` when `mohamed` exists, and confirm "Username already exists" with no 500 error.
- Run forgot password with mixed-case email, and confirm the code is sent.

---

## Step 2: Money as integer cents (issue 2.2)

Today `Watch.price`, `Order.total` and `OrderItem.unitPrice` are bare `Decimal` fields, which Postgres creates as `DECIMAL(65,30)`.

### 2a. Schema
```prisma
model Watch {
  priceCents Int        // USD cents, e.g. 1250000 = $12,500.00
  // remove: price Decimal
}
model Order {
  totalCents Int        // USD cents
  // remove: total Decimal
}
model OrderItem {
  unitPriceCents Int    // USD cents, snapshot at purchase time
  // remove: unitPrice Decimal
}
```
Add a `///` doc comment on each field saying "USD minor units (cents)". Prisma puts that comment into the generated types.

### 2b. Migration with data preserved
Run `npx prisma migrate dev --create-only --name money_to_integer_cents`. Prisma will generate DROP + ADD statements, which lose data and fail on non-empty tables because the new columns are NOT NULL. Rewrite the SQL to convert instead, for each of the three columns:
```sql
ALTER TABLE "Watch" ADD COLUMN "priceCents" INTEGER;
UPDATE "Watch" SET "priceCents" = ROUND("price" * 100)::INTEGER;
ALTER TABLE "Watch" ALTER COLUMN "priceCents" SET NOT NULL;
ALTER TABLE "Watch" DROP COLUMN "price";
```
Repeat the same pattern for `Order.total → totalCents` and `OrderItem.unitPrice → unitPriceCents`. Then run `npx prisma migrate dev`, and confirm that `npx prisma migrate diff` reports no drift.

Use `Int` (max about $21.4M per row). That is fine for a single watch. If you expect order totals above that, use `BigInt` for `totalCents` only. Note that `BigInt` doesn't serialise to JSON either, so stick with `Int` unless that limit is real.

### 2c. Money helpers
Create `src/lib/money.ts`:
```ts
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

export const formatCents = (cents: number) => usd.format(cents / 100)
export const dollarsToCents = (dollars: number) => Math.round(dollars * 100)
```
The future currency switcher will build on `formatCents` (convert, then format with the chosen currency).

### 2d. Acceptance checks
- `npx prisma migrate reset` then `npx prisma db seed` both run clean.
- Run `grep -rn "Decimal\|\.price\b\|\.total\b\|unitPrice\b" src prisma lib` and confirm nothing outside the generated client still refers to the old fields.

---

## Step 3: A server-only data layer that returns plain objects (issue 2.3)

Integer cents (step 2) removes the `Decimal` serialisation problem. The underlying rule still needs to live somewhere: **Server Components and Server Actions must never pass raw Prisma rows to Client Components.** Rows can carry non-serialisable types (`Decimal`, `BigInt`) and secret fields (`passwordHash`). Set that rule up now, before the catalog is built.

### 3a. Install and use `server-only`
`npm i server-only`, and add `import "server-only"` at the top of `lib/prisma.ts`. Any accidental import of Prisma from a `"use client"` file will then fail the build.

### 3b. Safe user selection (`src/app/(auth)/_utils/session.ts`)
`getCurrentUser` does `include: { user: true }`, so `passwordHash` goes into every Server Component that calls it. Replace it with an explicit select, and export the select and its type for reuse:
```ts
export const publicUserSelect = {
  id: true, username: true, email: true, role: true, emailVerifiedAt: true,
} satisfies Prisma.UserSelect

export type PublicUser = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>
```
Use `include: { user: { select: publicUserSelect } }` in `getCurrentUser`.

Also wrap `getCurrentUser` in React's `cache()` (`import { cache } from "react"`), so several callers in one request share one DB query. Check the bundled Next.js docs for the current guidance on `cache` with `cookies()` before doing this.

### 3c. Catalog DTO module (scaffold for upcoming pages)
Create `src/data/watches.ts` (starts with `import "server-only"`). It exports:
- `type WatchCard = { id, name, brandName, priceCents, imageUrl: string | null }`. These are plain, serialisable fields only.
- `getActiveWatches(): Promise<WatchCard[]>`, which filters `isActive: true`, `select`s only the needed columns, includes the brand name and the first image (`orderBy: { sortOrder: "asc" }, take: 1`), and maps each row to `WatchCard`.

That is enough to set the pattern. Don't build catalog UI in this task.

### 3d. Acceptance checks
- `npm run build` passes.
- The type of `getCurrentUser()` no longer contains `passwordHash`. Confirm with typecheck and by hovering the type.

---

## Step 4: Indexes for foreign keys and known queries (issue 2.4)

Postgres doesn't index foreign key columns automatically. Add the following to `prisma/schema.prisma`:

| Model | Add | Serves |
| --- | --- | --- |
| `Watch` | `@@index([brandId])` | Filter by brand; FK checks when deleting a brand |
| `Watch` | `@@index([isActive, createdAt])` | Catalog listing, newest first |
| `Watch` | `@@index([isActive, priceCents])` | Catalog sorted by price |
| `WatchImage` | none needed | `@@unique([watchId, sortOrder])` already leads with `watchId` |
| `FavoriteWatch` | `@@index([watchId])` | FK side not covered by `@@unique([userId, watchId])` |
| `CartItem` | `@@index([watchId])` | FK side not covered by `@@unique([cartId, watchId])` |
| `Order` | `@@index([userId, createdAt])` | "My orders", newest first |
| `OrderItem` | `@@index([orderId])` | Line items for an order |
| `OrderItem` | `@@index([watchId])` | FK checks; "has this watch been sold" |
| `Session` | `@@index([expiresAt])` | Expired-session cleanup |
| `VerificationCode` | replace `@@index([userId])` with `@@index([userId, type])` | Matches the `findFirst`/`deleteMany` filters in `_utils/verificationCode.ts` |
| `VerificationCode` | `@@index([expiresAt])` | The cleanup cron's `deleteMany({ expiresAt: { lt } })` |

Migration: `npx prisma migrate dev --name add_fk_and_query_indexes`. This migration contains only `CREATE INDEX` / `DROP INDEX`, nothing else.

Acceptance check: run `\d "OrderItem"` (or check in Prisma Studio / psql) and confirm the indexes exist.

---

## Step 5: Delete behaviour (issue 2.5)

Today `Cart`, `CartItem`, `FavoriteWatch`, `WatchImage`, `Order` and `OrderItem` use the default `onDelete: Restrict`. Deleting a user who has a cart or a favourite fails.

### 5a. Relation rules

| Relation | New rule | Reason |
| --- | --- | --- |
| `Cart.user` | `onDelete: Cascade` | A cart belongs to its user |
| `CartItem.cart` | `onDelete: Cascade` | Lines belong to their cart |
| `CartItem.watch` | `onDelete: Cascade` | A deleted watch disappears from carts |
| `FavoriteWatch.user` | `onDelete: Cascade` | Owned data |
| `FavoriteWatch.watch` | `onDelete: Cascade` | Owned data |
| `WatchImage.watch` | `onDelete: Cascade` | Images belong to their watch |
| `Watch.brand` | keep `Restrict` | Don't silently delete a brand's whole catalog |
| `OrderItem.order` | `onDelete: Cascade` | Lines belong to their order |
| `OrderItem.watch` | keep `Restrict` | Sold watches can't be hard-deleted. Unlist them with `isActive = false` instead |
| `Order.user` | `userId String?` + `onDelete: SetNull` | Orders outlive the account |

### 5b. Customer snapshot on `Order`
Because `Order.userId` can now become null, store who placed the order:
```prisma
model Order {
  userId        String?
  customerEmail String   @db.Citext   // snapshot at purchase time
  user          User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  // ...
}
```
Migration: `npx prisma migrate dev --create-only --name relation_delete_rules`. If the `Order` table has rows, add a backfill before the NOT NULL is applied:
```sql
UPDATE "Order" o SET "customerEmail" = u.email FROM "User" u WHERE u.id = o."userId";
```
Use the same add-nullable, backfill, then SET NOT NULL pattern as step 2b.

### 5c. Acceptance checks
In a scratch script or Prisma Studio on the dev DB:
- Create a user with a cart item, a favourite and an order, then delete the user. The cart, its items and the favourites are gone. The order still exists with `userId = null` and `customerEmail` set.
- Try to delete a watch that appears in an `OrderItem`. It must fail with a foreign key error.
- Delete a watch with images and no orders. Its images are removed too.

---

## Step 6: Wrap-up

- Update `prisma/seed.ts` so it still runs after these changes (`priceCents`, `customerEmail`). Keep the seed small; a full catalog seed is a separate task.
- Update `CLAUDE.md`: money is stored as integer cents in USD; email and username are `citext`; Prisma is server-only; use `publicUserSelect` for user data.
- Final checks: `npx prisma migrate reset` (dev only), `npx prisma db seed`, `npm run typecheck`, `npm run lint`, `npm run build`.
- Open a PR from `fix/schema-high-priority`. Describe each migration and the decisions table above. **Don't run any of these migrations against a production database** as part of this task.

## Out of scope for this task
Issues 2.6 to 2.18 from the review (slugs, spec columns, `OrderStatus` lifecycle, address, CHECK constraints, hashed session ids, and so on). Do them later in separate PRs.
