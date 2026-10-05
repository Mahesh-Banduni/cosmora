# Cosmora

AI lead matching and outbound email campaigns, built on Next.js 16, Prisma 7, Neon Postgres, and Neon Object Storage.

## What V1 does

**Admin-managed lead database → AI/user lead matching → authorized lead selection → email campaign builder → AI/HTML/visual email creation → personalization → the user's own SMTP → campaign sending → basic analytics.**

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16.3.8 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS v4 (`app/globals.css` tokens) |
| Database | Neon Postgres via Prisma 7 + `@prisma/adapter-neon` |
| Object storage | Neon Object Storage (S3-compatible, `@aws-sdk/client-s3`) |
| Auth | NextAuth v4 (JWT sessions, Credentials provider) |
| Email | Nodemailer, per-user SMTP credentials |
| AI | OpenAI-compatible chat completions |

## Setup

```bash
npm install
cp .env.example .env      # then fill in the values
npm run db:push           # create the schema
npm run seed              # optional demo data
npm run dev
```

### Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled Neon connection used by the app |
| `DATABASE_URL_UNPOOLED` | Direct Neon connection used by the Prisma CLI |
| `AUTH_SECRET` | NextAuth JWT signing secret |
| `ENCRYPTION_KEY` | 64 hex chars; encrypts SMTP passwords at rest |
| `AWS_REGION` | Neon Object Storage region |
| `AWS_ENDPOINT_URL_S3` | Branch storage endpoint |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Neon storage credential (`token_id` / `s3_secret_access_key`) |
| `NEON_STORAGE_BUCKET` | Bucket for uploaded media |
| `AI_API_KEY` / `AI_BASE_URL` / `AI_MODEL` | AI provider |
| `QUEUE_SECRET` | Bearer token guarding `POST /api/queue/process` |

### Neon Object Storage

Create a credential with storage scopes, then declare the bucket:

```bash
neon credentials create --scope storage:read --scope storage:write
neon buckets create cosmora-media
```

`lib/storage.ts` points a standard S3 client at the branch endpoint with
`forcePathStyle: true` and `requestChecksumCalculation: "WHEN_REQUIRED"`.

### Seed accounts

`npm run seed` creates `admin@cosmora.dev` and `rep@cosmora.dev`, both with
password `Cosmora123!`.

## Routes

### Public
`/` `/features` `/pricing` `/about` `/faq` `/contact`
`/legal/terms` `/legal/privacy`

Marketing pages live in `app/(marketing)/` and share the chrome in
`app/components/marketing/` (`MarketingShell`, `SiteHeader`, `SiteFooter`,
`PageHero`, `SectionHeading`, `MarketingImage`, `ClosingCta`, `FaqAccordion`,
`LegalPage`). Section imagery is committed under `public/images/marketing/`, so
no remote image host is required and `next.config.ts` stays empty.

### Auth
`/login` `/register` `/forgot-password` `/reset-password`

### Admin (`/admin`) — role-gated
`/admin` `/admin/leads` `/admin/leads/[id]` `/admin/contacts` `/admin/categories`
`/admin/imports` `/admin/users` `/admin/compliance` `/admin/audit`

### User (`/dashboard`) — role-gated
`/dashboard` `/dashboard/icps` `/dashboard/icps/new` `/dashboard/icps/[id]`
`/dashboard/leads` `/dashboard/saved` `/dashboard/campaigns`
`/dashboard/campaigns/new` `/dashboard/campaigns/[id]` `/dashboard/builder`
`/dashboard/smtp` `/dashboard/analytics` `/dashboard/settings`

### API
`/api/auth/[...nextauth]` `/api/email/open` `/api/email/click`
`/api/email/unsubscribe` `/api/queue/process`

## Architecture notes

- **Route protection.** `proxy.ts` (Next 16 renamed `middleware.ts`) redirects
  unauthenticated users and enforces role before rendering. Role is re-checked
  server-side in every admin layout and at the top of every server action.
- **Server/client boundary.** `lib/action-result.ts` and `lib/merge-tokens.ts`
  hold everything client components share, because `lib/utils.ts` imports
  Prisma and cannot be pulled into a client bundle.
- **Matching.** `lib/lead-matching.ts` builds a Prisma `where` clause from an
  ICP, scores each candidate with a weighted rubric, and persists matches and
  scores. Exclusions are enforced in the query, so no caller can bypass them.
- **Lead access.** Contact details are hidden in the leads query unless
  `availability === "UNLOCKED"`, which is only set after a credit transaction
  succeeds.
- **Sending.** `lib/queue.ts` enforces the daily limit and inter-send delay,
  re-checks suppression at send time, retries transient failures, and
  auto-suppresses hard bounces. Trigger it with a cron calling
  `POST /api/queue/process` with `Authorization: Bearer $QUEUE_SECRET`.
- **Tracking.** Outbound emails carry an open pixel and click-redirect URLs
  keyed to a per-message `trackingToken`, plus a compliance footer with an
  unsubscribe link.

## Style conventions

Use the global utilities in `app/globals.css` rather than ad-hoc values:

- Headings: `.h1`–`.h7` or semantic tags
- Body: `.para-text-lg` / `-md` / `-sm` / `-xs` / `-xxs`
- Spacing: `p-scale-N`, `gap-scale-N`, `mb-scale-N` and the `-sm` / `-md` / `-lg` variants
- Buttons: the `Button` component from `app/components/ui/store`
- Colors: `var()` tokens such as `text-[var(--text-primary)]`, `bg-[var(--card)]`, `border-[var(--border)]`

## Commands

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run db:push    # sync schema to Neon
npm run db:studio  # browse data in Prisma Studio
npm run seed       # demo data
```

## Not in V1

Deliberately deferred: AI sales agent, follow-up sequences, AI reply handling,
advanced scoring and buying-intent signals, A/B testing, conversion and revenue
attribution, lead marketplace, CRM integrations, multi-org/agency features, and
automated enrichment.