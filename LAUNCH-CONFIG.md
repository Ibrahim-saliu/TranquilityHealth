# Production launch config & seed (Replit)

Hand-off for provisioning Tranquility Health on Replit and seeding the first
accounts. Pairs with `RELEASE-RUNBOOK.md` (which covers the *dev*-database
repair — **not needed for a fresh prod database**, see below).

Scope of this launch: **web + intake + admin** (request → review → invite →
onboard → schedule). Live telehealth video is a deferred fast-follow.

---

## 0. Key assumption — confirm with Replit

Prod uses a **new, empty Postgres database** that Replit provisions. On first
boot the API automatically runs all migrations (`0000`–`0006`) against it and
starts serving. **No repair step is required** — the repair tooling only exists
for the older dev database that was left in a partial state.

> If instead prod were seeded from a *copy* of the current dev database, run the
> repair from `RELEASE-RUNBOOK.md` first. For a fresh DB, skip it.

---

## 1. Environment variables / secrets

### Required

| Name | Value | Notes |
|---|---|---|
| `DATABASE_URL` | *(Replit provides)* | Set automatically by Replit's Postgres. Just confirm it's present. |
| `SESSION_SECRET` | a long random string (32+ chars) | **The API refuses to start in production without it.** Generate once, keep stable (rotating it logs everyone out). |
| `NODE_ENV` | `production` | Turns on the **Secure** flag for the session cookie and the fail-closed `SESSION_SECRET` check. |
| `PORT` | *(Replit provides)* | Set automatically. |

Trust-proxy is enabled automatically in the Replit environment (it detects
`REPL_ID`), so secure cookies work behind Replit's HTTPS proxy with no extra
setting.

### Routing — same origin (the plan): nothing to set

Web is served at `/` and the API at `/api` on the **same domain**. In this shape
you do **not** set `CORS_ORIGINS` and you leave `SESSION_COOKIE_SAMESITE` at its
default (`lax`). The frontend already calls the API at same-origin `/api`.

<details>
<summary>Only if web and API end up on <b>different</b> origins (not the plan)</summary>

| Name | Value |
|---|---|
| `CORS_ORIGINS` | comma-separated list of the web origin(s), e.g. `https://app.example.com` |
| `SESSION_COOKIE_SAMESITE` | `none` (required for cross-site cookies; it also forces the Secure flag) |

</details>

### Recommended

| Name | Value | Notes |
|---|---|---|
| `APP_BASE_URL` | prod base URL, e.g. `https://app.yourclinic.com` | Makes staff/patient **invite links absolute**. Without it, invite links are relative paths. |

### Object storage — only if provider photo uploads are used

Set these via Replit's **Object Storage** tool (it also sets
`DEFAULT_OBJECT_STORAGE_BUCKET_ID`). If you're not using provider photo uploads
at launch, leave them unset — only the upload endpoints error; nothing else does.

| Name | Value |
|---|---|
| `PUBLIC_OBJECT_SEARCH_PATHS` | comma-separated public paths from the bucket |
| `PRIVATE_OBJECT_DIR` | the private object directory |

### Notifications — optional, to turn on new-request alerts at launch

Not a launch gate: without these, new requests still land in the admin queue.
To enable email/SMS alerts on a new request:

1. Authorize the **Resend** and **Twilio** connectors in Replit.
2. Set:

| Name | Value |
|---|---|
| `NOTIFICATION_EMAIL_FROM` | verified sender, e.g. `Tranquility Health <alerts@yourdomain.com>` |
| `ADMIN_PORTAL_URL` | prod base URL (used for the "review securely" link) |
| `TWILIO_FROM_NUMBER` **or** `TWILIO_MESSAGING_SERVICE_SID` | your Twilio sender |

3. Add recipient email/phone under **Admin → Notifications** in the app.

> SMS additionally needs Twilio A2P **10DLC** registration (carrier approval,
> can take days). Email works immediately once the sender domain is verified.

---

## 2. Deploy order (what happens automatically)

1. Configure the required secrets above.
2. Publish the app on Replit.
3. On boot the API: runs migrations → ensures the session table → serves.
   - Success log: `Database migrations up to date` then `Server listening`.
   - If migrations fail it logs a `fatal` **DATABASE MIGRATION FAILED** line and
     exits without serving — do not loop restarts; fix the DB state and redeploy.
4. Confirm health: `GET /api/healthz` returns **200**.

---

## 3. Seed the first accounts (one-time)

### Admin account — idempotent script

Run once in the prod environment shell (re-running is safe; it exits if an admin
already exists):

```bash
ADMIN_EMAIL="you@yourclinic.com" \
ADMIN_PASSWORD="<a strong password, 8+ chars>" \
pnpm --filter @workspace/api-server run seed-admin
```

Then **change/verify** that password after first login. Do not commit these
values anywhere.

### Provider profile — via the admin portal (no script)

1. Log in at `/login` with the admin account.
2. Go to **Admin → Providers → Add**.
3. Fill in the provider's name, credentials, license state, and bio, and mark
   **active**. (Providers must be active to be schedulable.)

---

## 4. Post-deploy smoke test (flip to GO)

Run against the **published URL**, not the preview:

- [ ] `GET /api/healthz` → 200
- [ ] Admin login succeeds; session persists across requests; logout works
- [ ] `/admin/*` rejects unauthenticated users; `/app/*` rejects non-patients
- [ ] Submit a request on `/request-appointment` → it appears in **Admin → Requests**
- [ ] Invite that request → accept the invite → complete onboarding (details + both consents) → lands on the patient dashboard
- [ ] Admin schedules an appointment → it shows for the patient
- [ ] Admin cancels a scheduled appointment
- [ ] (If enabled) a new request produces an email/SMS alert to the configured recipient

When these pass, the web/intake/admin product is **GO**.

---

## 5. Not in this launch (fast-follow)

- **Live telehealth video** — needs a BAA-signed vendor; the session page is a
  gated placeholder until then. Patients can still be onboarded and scheduled.
- Anything in the "gold-plating" map that's already built stays as-is; no removal.
