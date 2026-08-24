# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit). `out` points at `./migrations`.
- `migrations/` — committed, versioned SQL migrations + `meta/` journal (source of truth for deploys)
- `src/migrate.ts` — migration runner (applies pending migrations, tracked in `drizzle.__drizzle_migrations`)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

#### Schema changes & migrations

Deploys apply **versioned migrations**, not `push`. The API server runs
`runMigrations()` automatically at startup (before it accepts traffic), so a
deploy always brings the schema up to date before serving. The build copies
`lib/db/migrations/` next to the bundled server (`dist/migrations`).

Workflow for a schema change:

1. Edit the schema under `lib/db/src/schema/`.
2. `pnpm --filter @workspace/db run generate` — writes a new timestamped SQL file into `migrations/`. Commit it (SQL + `meta/`).
3. Deploy. The server applies it on boot. (Or apply manually with `pnpm --filter @workspace/db run migrate`.)

Local dev can still use `pnpm --filter @workspace/db run push` / `push-force` for fast iteration, but anything shipped must have a committed migration.

**Startup migration is safe on any starting state** — `runMigrations()`
(`lib/db/src/migrator.ts`) self-baselines:

- **Fresh/empty DB** → applies `0000_baseline` and everything after.
- **Existing DB created with `push`** (our current case) → detects that *all* the
  app tables already exist but nothing is recorded, marks `0000_baseline` as
  applied so it doesn't try to re-create them, then applies only newer migrations.
- **Already-migrated DB** → no-op.
- **Partially initialized DB** (some but not all baseline tables) → the runner
  **throws** rather than guessing, so an inconsistent database is surfaced up
  front instead of failing cryptically on a later migration.

No manual baseline step is required.

**Repairing a partially initialized database.** If a database is missing one or
more baseline tables (e.g. `consent_records`), the runner refuses to start and
reports which tables are missing — it will not guess. To fix it:

1. **Back up the database first.**
2. Run the repair, which creates ONLY the missing baseline table(s) — idempotent
   `CREATE TABLE IF NOT EXISTS`, so existing tables and their data are never
   dropped or overwritten — then applies all pending migrations:

   ```
   CONFIRM_DB_REPAIR=1 DATABASE_URL=... pnpm --filter @workspace/db run repair
   ```

   It refuses to run without `CONFIRM_DB_REPAIR=1`.
3. Restart the API and confirm `/api/healthz` responds and login works.

Repair is opt-in and never runs automatically — normal startup still refuses a
partial database.

**Migration failure = no startup.** If migrations fail, the server logs a
`fatal` "DATABASE MIGRATION FAILED" line and exits non-zero without serving —
serving against an incompatible schema is worse. Investigate the fatal log and
fix the database/migration state before redeploying rather than letting the
platform loop on restarts.

**Concurrent startup is safe.** `runMigrations()` takes a session-level
`pg_advisory_lock` around the whole baseline+migrate, so if several instances
boot at once only one migrates; the others block and then find nothing to do.

**Consent records are append-only at the DB level.** Migrations
`0002`/`0003` install triggers that block `UPDATE`, `DELETE`, and `TRUNCATE` on
`consent_records`, and `document_version` is `NOT NULL` so the unique
`(patient, type, version)` constraint can't be bypassed with NULLs.

> Limit: a Postgres **superuser or the table owner** can still disable/drop the
> trigger or drop the table — a trigger can't prevent that. For true
> tamper-resistance the API/runtime should connect as a **dedicated role without
> DDL/TRUNCATE privileges** on `consent_records` (privilege separation). That's
> an ops/role configuration, not something the migration can enforce on its own.

#### Tests

- Unit (no database, always run): self-baseline decision (`lib/db`) and consent
  version/dedup rules (`api-server`). `pnpm --filter @workspace/db run test:run`,
  `pnpm --filter @workspace/api-server run test:run`.
- Integration (real Postgres, opt-in): `lib/db/src/migrator.integration.test.ts`
  covers the append-only trigger (insert allowed; update/delete/truncate
  blocked), consent uniqueness + version change, the `RESTRICT` FK, self-baseline
  on an existing push-created DB, partial-DB refusal, and concurrent-startup
  locking. They **skip** unless `TEST_DATABASE_URL` points at a throwaway
  Postgres:

  ```
  TEST_DATABASE_URL=postgres://postgres@127.0.0.1:5432/thtest \
    pnpm --filter @workspace/db run test:run
  ```

Not yet covered: full HTTP-level concurrent-request tests (e.g. two cancel or
onboarding requests racing through the Express routes) — the underlying DB
guarantees they rely on (atomic conditional update, unique constraint, advisory
lock) are proven above.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

### `artifacts/tranquility-health` (`@workspace/tranquility-health`)

**Tranquility Health** — HIPAA-conscious telehealth MVP (mental health practice licensed in Texas and Maryland; insurance accepted).
React + Vite SPA with full public website, admin dashboard, and Phase 3 patient auth + invite system.

- Served at `/` (preview path root)
- `pnpm --filter @workspace/tranquility-health run dev` — dev server on port 20640
- Design system: Tailwind v4, teal/indigo/violet palette, slate-* text (not gray-*)

**Route structure:**
- Public routes (`/`, `/about`, `/services`, `/hours`, `/faq`, `/contact`, `/request-appointment`) — wrapped in `PublicLayout` (Navbar + Footer)
- Auth routes: `/login` (Login page), `/invite/:token` (InviteAccept page) — standalone pages, no shared layout
- Patient app routes (`/app/dashboard`, `/app/onboarding`, `/app/appointments`, `/app/session`) — wrapped in `AppLayout`, guarded by `RequirePatient`
- Admin routes (`/admin/dashboard`, `/admin/requests`, `/admin/appointments`, `/admin/providers`, `/admin/team`) — wrapped in `AdminLayout`, guarded by `RequireAdmin` (allows admin, collaborator, provider)
- Provider-scoped route (`/admin/provider-dashboard`) — wrapped in `AdminLayout`, only shows provider nav

**Auth system (Phase 3):**
- `src/lib/auth/context.tsx` — `AuthProvider` + `useAuth()` hook (fetches `GET /api/auth/me` on mount)
- `src/lib/auth/guards.tsx` — `RequirePatient` and `RequireAdmin` route guards (redirect to `/login`)
- Session via httpOnly cookie `th.sid` (express-session on the API server, 8h expiry)
- Admin user: `admin@tranquilityhealth.com` (seeded in DB, password set at setup)

**Roles:**
- `admin`: Full access to all admin routes and actions
- `collaborator`: Access to admin portal except team-management mutations
- `provider`: Scoped portal access — dashboard at `/admin/provider-dashboard`, profile at `/admin/providers`; blocked from `/admin/team` and `/admin/requests`
- `patient`: Access to patient app routes only (`/app/*`)

**Provider invite flow:**
- Admin uses "Invite a provider" form on Team page → POST `/api/admin/invite-provider`
- Provider receives invite link `/admin/accept-invite/:token` → creates account with "provider" role
- On login, providers are redirected to `/admin/provider-dashboard`
- Provider nav shows only "Dashboard" and "My Profile" links

**Key source files:**
- `src/App.tsx` — router wrapping all routes with `AuthProvider`, 18 routes in four groups
- `src/layouts/` — PublicLayout, AppLayout, AdminLayout (role-aware nav: provider vs admin links)
- `src/components/public/` — Navbar, Footer, and all public section components
- `src/pages/public/` — 9 public pages (7 marketing + Login + InviteAccept)
- `src/pages/app/` — 4 patient app pages
- `src/pages/admin/` — 6 admin pages including ProviderDashboard
- `src/lib/admin-api/index.ts` — typed admin API client (includes `credentials: "include"`)
- `src/types/roles.ts` — UserRole type (admin | collaborator | provider | patient), ROLES constants
- `src/lib/config/routes.ts` — ROUTES constants for all route paths including providerDashboard
- `src/lib/config/env.ts` — ENV flags, API_BASE_URL

**Testing (Vitest + Testing Library):**
- `pnpm --filter @workspace/tranquility-health run test` — watch mode
- `pnpm --filter @workspace/tranquility-health run test:run` — single run (CI)
- Config: `vitest.config.ts` (jsdom env, `@` alias, `src/test/setup.ts` registers
  jest-dom matchers). Test files live next to the code as `*.test.ts(x)` and are
  excluded from the app's `tsc` typecheck.
- Current coverage: schedule formatting + open/closed logic (`useOpenStatus`, with
  fake timers pinned to CST), auth route guards (`RequireAdmin`/`RequirePatient`),
  the `cn` class helper, and the scroll-reveal primitives.
