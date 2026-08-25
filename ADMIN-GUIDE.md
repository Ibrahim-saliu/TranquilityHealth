# Tranquility Health — Admin User Guide

A practical guide for the administrator running the app: how to navigate the
public website and the admin portal, and how to test the full patient journey
end to end.

Throughout this guide, replace `https://YOUR-SITE` with your live web address.
The website and the admin portal are the same site; you just visit different
pages (URLs). You need to **sign in** to reach any page that starts with
`/admin`.

---

## 1. The three parts of the app

| Part | Who uses it | Starts at |
|---|---|---|
| **Public website** | Anyone (prospective patients) | `https://YOUR-SITE/` |
| **Admin portal** | You and your staff | `https://YOUR-SITE/admin/dashboard` |
| **Patient app** | Patients you've invited | `https://YOUR-SITE/app/dashboard` |

---

## 2. Page directory (URLs)

### Public website (no sign-in)
| Page | URL |
|---|---|
| Home | `/` |
| About | `/about` |
| Services | `/services` |
| Hours | `/hours` |
| FAQ | `/faq` |
| Contact | `/contact` |
| Request an appointment | `/request-appointment` |
| Privacy Policy | `/privacy-policy` |
| Terms of Service | `/terms-of-service` |
| HIPAA Notice | `/hipaa-notice` |
| Sign in | `/login` |

### Admin portal (sign-in required)
| Page | URL | What it's for |
|---|---|---|
| Dashboard | `/admin/dashboard` | At-a-glance counts of appointment requests |
| Requests | `/admin/requests` | Review incoming requests and invite patients |
| Appointments | `/admin/appointments` | Schedule, view, and cancel appointments |
| Providers | `/admin/providers` | Add and edit provider profiles |
| Team | `/admin/team` | Invite staff (collaborators / providers) |
| Notifications | `/admin/notifications` | Manage who gets new-request alerts |

### Patient app (patient sign-in required)
| Page | URL | What it's for |
|---|---|---|
| Onboarding | `/app/onboarding` | New patient completes details + consents |
| Dashboard | `/app/dashboard` | Next appointment + "Join" button |
| Appointments | `/app/appointments` | Upcoming and past visits |
| Session | `/app/session` | The video visit room (opens near appointment time) |

---

## 3. Signing in as admin

1. Go to `https://YOUR-SITE/login`.
2. Enter the admin email and password created during setup.
3. You'll land on the admin dashboard. Your session stays active for 8 hours;
   use **Sign out** when you're done, especially on a shared computer.

If you're ever redirected to `/login` unexpectedly, your session has expired —
just sign in again.

---

## 4. The core workflow (what you'll do every day)

The heart of the app is turning a **request** into a **scheduled appointment**.

### Step 1 — A request comes in
When someone fills out `/request-appointment`, it appears under
**Requests** (`/admin/requests`) with the status **New**. (If email/SMS alerts
are turned on, you'll also get a notification.)

### Step 2 — Review the request
Open **Requests**, click a request to see the person's details and preferred
time. Move it through the statuses as you work it:

- **New** → just arrived
- **Under review** → you're looking into it
- **Approved** / **Rejected** → your decision
- **Invited** → you've decided to bring them on as a patient (this creates their
  invite — see Step 3)

### Step 3 — Invite the patient
Setting a request to **Invited** generates a secure, one-time invite link for
that person (valid for 72 hours). See **Section 6** for exactly how to get that
link to the patient today, and an important note about it.

### Step 4 — Schedule the appointment
Once the patient has accepted their invite and finished onboarding, go to
**Appointments** (`/admin/appointments`) → **Schedule appointment**:

- Pick the **patient** (only people who've created an account appear here),
- pick an **active provider**,
- choose the **type**, **date/time**, and **duration**, and save.

The system won't let you book a past time, an inactive provider, or a time that
overlaps another appointment for that provider.

### Step 5 — Manage appointments
On **Appointments** you can filter Upcoming / Past / All and **Cancel** a
scheduled appointment (cancelling is permanent for that appointment; the record
is kept).

---

## 5. The other admin pages

- **Providers** (`/admin/providers`): add each clinician's name, credentials,
  license state, and bio. **A provider must be marked _active_ to be
  schedulable.** Add at least one before scheduling.
- **Team** (`/admin/team`): invite additional staff. Collaborators help manage
  requests/appointments; providers get their own provider view.
- **Notifications** (`/admin/notifications`): add the email and phone that
  should receive a "new request" alert. (Alerts only send once the email/SMS
  providers are connected — ask your developer if unsure.)

---

## 6. Inviting a patient — how to get the link (read this)

> **Heads-up / current limitation.** The patient invite link is **not yet shown
> in the admin screen**, and it is written to the server logs with the wrong
> path. Until that's improved (a small fix is recommended — see the end), use
> the procedure below carefully.

When you mark a request **Invited**, the app records a `[INVITE]` line in the
**server logs** (in Replit: open the app's Console / Logs). It looks like:

```
[INVITE] patient invite for jane@example.com: https://YOUR-SITE/admin/accept-invite/ab12cd...
```

**Two things to correct before you send it to a patient:**

1. **Change the path** from `/admin/accept-invite/` to **`/invite/`**. Patients
   accept at `/invite/<token>`. The `/admin/accept-invite/` page is for staff
   only and will reject a patient link.
2. So the link you actually send the patient is:
   `https://YOUR-SITE/invite/ab12cd...`

The patient opens that link, sets a password, and is taken straight into
onboarding.

---

## 7. Test the full patient journey (end to end)

Do this once before go-live to confirm everything works. Use a real email
inbox you control for the "patient," and a **private/incognito browser window**
for the patient steps so it doesn't clash with your admin session.

1. **Submit a request.** In a normal window, go to `/request-appointment` and
   submit as a test patient (e.g. name "Test Patient", your own email).
2. **Invite the patient.** In the admin portal, open `/admin/requests`, find the
   new request, and set it to **Invited**.
3. **Get the invite link** using **Section 6** (from the server logs, with the
   path changed to `/invite/<token>`).
4. **Accept the invite.** Open that `/invite/<token>` link in an
   **incognito window**, choose a password. You're now signed in as the test
   patient and land on **`/app/onboarding`**.
5. **Complete onboarding.** Fill in the demographics and check both consents,
   then submit. You'll be taken to **`/app/dashboard`** (it will say "no
   upcoming appointments" yet).
6. **Schedule the appointment.** Back in your admin window, go to
   `/admin/appointments` → **Schedule appointment**, pick "Test Patient" and an
   active provider, choose a time a few minutes from now, and save.
7. **See it as the patient.** In the incognito window, refresh
   `/app/dashboard` and `/app/appointments` — the appointment now appears.
8. **Join window.** Within 10 minutes of the start time, a **Join** button
   appears on the dashboard/appointment; clicking it opens **`/app/session`**.
   (The live video call itself is a later addition; the room and gating work.)
9. **Cancel (optional).** In `/admin/appointments`, cancel the test appointment
   to confirm cancellation works.

If every step works, the request → invite → onboard → schedule → view/join loop
is healthy.

---

## 8. Tips for success

- **Add a provider first.** You can't schedule until at least one **active**
  provider exists (`/admin/providers`).
- **Patients appear in scheduling only after they've created an account.**
  Someone on the Requests list who hasn't accepted an invite yet won't show up
  in the "Schedule appointment" patient picker.
- **Licensure:** the practice serves patients physically located in **Texas and
  Maryland**. Don't onboard patients outside those states.
- **Onboarding is required.** A patient who hasn't finished onboarding is always
  routed back to `/app/onboarding` until they complete it.
- **PHI:** never put patient health details in email or the contact form.
  Clinical details belong in the secure video visit.
- **Invite links expire in 72 hours** and are single-use. If one expires, set
  the request back through **Invited** to generate a fresh link.

---

## Recommended small fix (makes this much easier)

The invite step above is clunky because the link only lives in server logs and
uses the wrong path. A recommended follow-up is to **show a copyable patient
invite link right on the Requests screen** when you mark a request "Invited"
(and correct the link path). Ask your developer to make that change — it removes
the log-reading and path-editing entirely.
