# Tranquility Health staging smoke-test report

**Run date:** August 24, 2026  
**Decision:** **NO-GO — do not publish**

## Scope

This run validated the deployed routing shape used by the registered artifacts:

- Tranquility Health web artifact: `/`
- API Server artifact: `/api`
- Health endpoint: `GET /api/healthz`
- Same-origin frontend API base: `/api`
- Session requests: `credentials: "include"`

## Results

| Check | Result | Evidence |
| --- | --- | --- |
| Web artifact build | PASS | Vite production build completed successfully |
| API artifact build | PASS | esbuild production bundle completed successfully |
| Workspace typecheck | PASS | Root `pnpm run typecheck` completed successfully |
| Web unit tests | PASS | 7 files, 40 tests |
| API unit tests | PASS | 1 file, 5 tests |
| Web workflow startup | PASS | Vite listening on the managed web port |
| API workflow startup | **FAIL** | Startup stopped before listening |
| Homepage `/` | PASS | Rendered through the preview origin |
| Login `/login` | PASS | Sign-in form rendered |
| Unauthenticated `/app/onboarding` protection | PASS | Redirected to `/login` |
| Unauthenticated `/admin/dashboard` protection | PASS | Redirected to `/login` |
| `GET /api/healthz` through preview routing | **FAIL** | Returned HTTP 502 |
| Patient login/session persistence | BLOCKED | API unavailable; no test credentials were exposed |
| Patient onboarding and consent | BLOCKED | API unavailable |
| Patient appointments | BLOCKED | API unavailable |
| Admin login/session persistence | BLOCKED | API unavailable; no test credentials were exposed |
| Admin scheduling and cancellation | BLOCKED | API unavailable |
| Logout and invalid-session behavior | BLOCKED | API unavailable |

The browser smoke tester observed the same results and reported no data mutation. Evidence screenshots from that run:

- Homepage: `7le0ci`
- Login page: `p3xsey`

## Root cause and release blocker

The API workflow log reports:

> `Database is partially initialized: found 7/8 baseline tables (missing: consent_records). Refusing to auto-baseline.`

The API intentionally exits before serving traffic when the schema is partial. The resulting preview request to `/api/healthz` returns 502. This is the correct fail-closed behavior, but it prevents the required authenticated smoke tests.

The database is reachable, but the missing-table repair is not part of this smoke-test run. No migration bypass, fallback session store, guessed credentials, or direct data mutation was used.

## Configuration verification

- **Routing:** frontend uses same-origin `/api`; the web artifact lists `/`, and the API artifact lists `/api`.
- **Cookies:** API uses httpOnly cookie `th.sid`, 8-hour max age, `SameSite=Lax` by default. Production enables `Secure`; proxy trust is enabled in production/Replit environments.
- **CORS:** credentialed CORS is enabled. No `CORS_ORIGINS` override is present; this is compatible with the current same-origin routing, but cross-origin deployment would require an explicit allowlist and `SameSite=None`.
- **Secrets:** `SESSION_SECRET`, `PRIVATE_OBJECT_DIR`, `PUBLIC_OBJECT_SEARCH_PATHS`, and `DEFAULT_OBJECT_STORAGE_BUCKET_ID` are present in the development environment. Secret values were not read or displayed.
- **Object storage:** required configuration is present, but upload/download runtime behavior could not be exercised while the API was unavailable.

## Go/no-go criteria

**NO-GO.** Do not publish until the development database has been repaired and proven safe, the API workflow starts cleanly, `/api/healthz` returns 200 through the preview routing, and the patient/admin authenticated flows are rerun successfully.
