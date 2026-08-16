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
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

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
