# Release runbook — Tranquility Health

Operational steps to take the app from the current **NO-GO** (see
`staging-smoke-test-report.md`) to a published release. Follow top to bottom.

There are **two independent launches**:

- **Web launch** — the marketing site + auth-gated portals. Gated only by the
  database repair below.
- **Patient-care launch** — accepting real appointments/visits. Additionally
  gated by the telehealth video integration (a product/vendor decision) and the
  clinical/legal content sign-off.

---

## 0. Preconditions

- [ ] You can reach the target database (`DATABASE_URL`) and the deploy env.
- [ ] Required secrets are set in the target environment (values not shown):
      `SESSION_SECRET` (the API refuses to start in production without it),
      `DATABASE_URL`, and object storage
      (`PRIVATE_OBJECT_DIR`, `PUBLIC_OBJECT_SEARCH_PATHS`,
      `DEFAULT_OBJECT_STORAGE_BUCKET_ID`).
- [ ] Same-origin routing is in place: web at `/`, API at `/api`
      (no `CORS_ORIGINS` / `SameSite=None` needed for this shape).

---

## 1. Repair the database (the current release blocker)

The API fail-closes because the database is partially initialized
(`7/8 baseline tables, missing: consent_records`). This is correct behavior —
it will not guess. Repair it deliberately:

1. **Back up the database first.** Take (and verify) a snapshot/dump you can
   restore from. Do not skip this.
2. Run the repair. It creates only the missing baseline table(s) — idempotent
   `CREATE TABLE IF NOT EXISTS`, so existing tables and their data are never
   dropped or overwritten — then applies all pending migrations and verifies the
   final `consent_records` schema (NOT NULL version, RESTRICT FK, unique
   constraint, append-only triggers):

   ```bash
   CONFIRM_DB_REPAIR=1 DATABASE_URL=<target> \
     pnpm --filter @workspace/db run repair
   ```

   It refuses to run without `CONFIRM_DB_REPAIR=1`. Repair runs in a
   transaction; on any error it rolls back and exits non-zero — re-check the DB
   state before retrying.
3. Confirm the schema is complete (8 tables) and the consent guarantees exist:

   ```bash
   psql "$DATABASE_URL" -c "select count(*) from information_schema.tables where table_schema='public';"           # expect 8
   psql "$DATABASE_URL" -c "select is_nullable from information_schema.columns where table_name='consent_records' and column_name='document_version';"   # expect NO
   psql "$DATABASE_URL" -c "select conname from pg_constraint where conname='consent_records_patient_type_version_uq';"                                  # expect 1 row
   psql "$DATABASE_URL" -c "select tgname from pg_trigger where tgrelid='consent_records'::regclass and not tgisinternal;"                               # expect no_update_delete + no_truncate
   ```

- [ ] Backup taken and verified.
- [ ] Repair completed without error.
- [ ] Schema checks above all pass.

> Going forward this won't recur: normal startup runs migrations automatically
> and self-baselines a fully-provisioned database. Repair is only for a
> partially initialized one, and never runs automatically.

---

## 2. Bring the API up and confirm health

- [ ] Restart the API workflow. Startup logs show `Database migrations up to date`.
- [ ] `GET /api/healthz` returns **200** through the published/preview routing
      (was 502 while the DB was partial).

If migrations fail at startup, the API logs a `fatal`
`DATABASE MIGRATION FAILED` line and exits without serving — fix the DB state
and redeploy rather than looping restarts.

---

## 3. Seed the minimum data

- [ ] A staff/admin account exists (`pnpm --filter @workspace/api-server run seed-admin`,
      or your existing admin). **Change/verify the initial credentials.**
- [ ] At least one active provider profile exists (create via the admin portal).
- [ ] Any initial configuration is present.

---

## 4. Re-run the authenticated smoke test (GO criteria)

Run against the actual published URL, not only the dev preview. Flip to **GO**
only when all pass:

- [ ] `GET /api/healthz` → 200.
- [ ] Admin login succeeds; session cookie (`th.sid`) persists across requests.
- [ ] Patient login succeeds; session persists.
- [ ] Logout works; a request with an invalidated session is rejected.
- [ ] `/admin/*` routes reject unauthenticated and non-staff users.
- [ ] `/app/*` routes reject unauthenticated and non-patient users; a patient
      who hasn't finished onboarding is routed to `/app/onboarding`.
- [ ] Patient onboarding completes (demographics + both consents) and writes a
      `consent_records` row; the patient is then routed to their dashboard.
- [ ] Admin schedules an appointment; it appears for the patient.
- [ ] Admin cancels a scheduled appointment (scheduled → cancelled only).
- [ ] Object storage upload/download works if provider photos/uploads are used.

Unit + integration coverage backing these paths (already green):
`pnpm run typecheck`, `pnpm --filter @workspace/tranquility-health run test`,
and — against a throwaway Postgres —
`TEST_DATABASE_URL=... pnpm --filter @workspace/db run test:run`.

---

## 5. Web launch

- [ ] Sections 1–4 complete and green on the published environment.
- [ ] Publish the web + API artifacts.
- [ ] Post-publish: re-confirm `/api/healthz`, one admin login, one patient login.

**The website can launch here** even if telehealth video is not yet wired.

---

## 6. Patient-care launch (additional gates)

Do **not** accept real appointments/visits until:

- [ ] Telehealth video is integrated — a BAA-signed, healthcare-appropriate
      vendor; server-created rooms or short-lived tokens; appointment-specific
      authorization; join-window enforcement; camera/mic permission handling;
      clear failure states; and **no meeting credentials in browser or server
      logs**. (The session page is a gated UI shell until this lands.)
- [ ] Clinical/legal content is confirmed: real clinician details, pricing and
      insurance language, TX/MD licensure and service-area statements, and a
      review of the privacy policy, terms, telehealth consent, and patient
      disclosures.
- [ ] Operational readiness: who can access patient data in the admin portal;
      backups + recovery tested; incident, account-recovery, and access-removal
      processes defined; audit-log access and retention expectations set.

---

## Appendix — rollback

- If repair or a deploy goes wrong, restore the backup from step 1.
- Consent records are append-only (UPDATE/DELETE/TRUNCATE are blocked at the DB
  level); a restore replaces the whole database rather than editing consent rows.
- For stronger tamper-resistance, run the API/runtime as a database role without
  DDL/TRUNCATE privileges on `consent_records` (privilege separation) — a
  superuser/owner can still drop the trigger, which the trigger alone can't
  prevent.
