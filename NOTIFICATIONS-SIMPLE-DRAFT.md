# Notifications: simple vs. full — comparison

Two ways to do "email + text me when a new appointment request comes in." Both
send the same generic, PHI-free alert linking to the admin portal. This is a
**draft for comparison** — the full version is what's currently merged and
working; the simple version (`notifications-simple.ts`) is not wired in.

## At a glance

| | **Full (current)** | **Simple (draft)** |
|---|---|---|
| Code | ~1,080 lines across 5 files | ~130 lines, 1 file |
| New DB tables | 2 (`admin_notification_recipients`, `notification_deliveries`) | 0 |
| Migrations | 3 (`0004`–`0006`) | 0 |
| Admin UI | Recipients screen (add/edit/remove) | none — recipients set in env/secrets |
| Delivery | outbox + lease + retry/backoff + background worker | direct fire-and-forget |
| Duplicate protection | unique index per (request, recipient, channel) | none needed (one send attempt) |
| Retry if provider is down | yes, automatic | no — that one alert is missed |
| Delivery history / audit | yes (every attempt recorded) | no (only a log line on failure) |
| Recipient management | in-app, per recipient, active/inactive | edit `NOTIFY_EMAILS` / `NOTIFY_PHONES` |

Both are **PHI-safe** (no patient details in the message or logs) and both are
**fire-and-forget** (a provider outage never blocks or fails the patient's
request — the request is always saved and visible in the admin queue).

## What you give up with the simple version

- **No retry.** If Resend/Twilio is momentarily down at the exact moment a
  request arrives, that single alert is missed. The request itself is safe and
  still shows in the queue, so at low volume this is usually fine.
- **No delivery record.** You won't be able to see "was the 3pm alert sent?" —
  only a warning in the server logs if a send failed.
- **Recipients live in env/secrets, not a UI.** To change who's notified you
  edit `NOTIFY_EMAILS` / `NOTIFY_PHONES` in Replit Secrets rather than an admin
  screen. (If you want the in-app recipients screen but still want to drop the
  outbox/worker, that's a sensible middle ground — keep the recipients table +
  admin page, swap only the delivery engine.)

## Configuration (simple version)

```
NOTIFY_EMAILS="clinic@example.com,owner@example.com"   # comma-separated
NOTIFY_PHONES="+15125550123"                            # E.164, comma-separated
NOTIFICATION_EMAIL_FROM="Tranquility Health <alerts@yourdomain.com>"
ADMIN_PORTAL_URL="https://app.yourdomain.com"
```

Resend and Twilio still connect through the same Replit connectors, so no API
keys are stored in the app.

## How you'd switch the request route to the simple version

In `artifacts/api-server/src/routes/appointment-requests.ts`, the current code
inserts the request **and** notification-outbox rows in one transaction, then
kicks the worker. The simple version replaces all of that with one call after
the request is saved:

```ts
// imports
import { notifyNewAppointmentRequest } from "../lib/notifications-simple";

// inside POST /appointment-requests, after inserting the request row:
const [request] = await db
  .insert(appointmentRequestsTable)
  .values({ ...parsed.data, status: "new" })
  .returning({ id: appointmentRequestsTable.id, status: appointmentRequestsTable.status });

notifyNewAppointmentRequest(); // fire-and-forget; never throws

res.status(201).json({ id: request.id, status: request.status });
```

No transaction wrapping the notification, no outbox insert, no worker.

## Recommendation

If the outbox engine is only bothering you conceptually, it's already built,
tested, and invisible to users — leaving it costs nothing. If you'd rather carry
less machinery, the simple version is a clean, honest fit for a low-volume
clinic. The middle ground (keep the admin recipients UI, drop the
outbox/worker/retry) is also available if the in-app recipient management is the
part you value.
