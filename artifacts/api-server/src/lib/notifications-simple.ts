/**
 * SIMPLE notification alternative (draft, for comparison — not yet wired in).
 *
 * When a new appointment request arrives, email and/or text the clinic's
 * configured recipients a generic, PHI-free "a new request is ready to review"
 * alert that links to the admin portal. Fire-and-forget: it never blocks or
 * fails the patient's request submission, and it logs (without PHI) on failure.
 *
 * Compared to the full delivery service, this drops the outbox table, the
 * lease/retry state machine, the background worker, the dedup index, and the
 * admin CRUD UI. Recipients are configured via environment variables instead of
 * an admin screen:
 *
 *   NOTIFY_EMAILS="clinic@example.com,owner@example.com"   (comma-separated)
 *   NOTIFY_PHONES="+15125550123"                            (E.164, comma-separated)
 *   NOTIFICATION_EMAIL_FROM="Tranquility Health <alerts@yourdomain.com>"
 *   ADMIN_PORTAL_URL="https://app.yourdomain.com"
 *
 * Trade-off: no delivery history and no automatic retry. If a provider is down
 * at that moment, that single alert is missed (the request is still safely
 * saved, and it's visible in the admin queue). For a low-volume clinic that is
 * usually an acceptable simplification.
 */
import { ReplitConnectors } from "@replit/connectors-sdk";
import { logger } from "./logger";

function envList(key: string): string[] {
  return (process.env[key] ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function reviewUrl(): string | null {
  const base = process.env["ADMIN_PORTAL_URL"]?.trim().replace(/\/+$/, "");
  return base ? `${base}/admin/requests` : null;
}

const SUBJECT = "New appointment request ready for review";

function alertText(): string {
  const url = reviewUrl();
  return [
    "A new appointment request is ready to review in the Tranquility Health admin portal.",
    url ? `Review securely: ${url}` : "Sign in to the admin portal to review it.",
  ].join("\n\n");
}

function alertHtml(): string {
  const url = reviewUrl();
  return `<p>A new appointment request is ready to review in the Tranquility Health admin portal.</p>${
    url ? `<p><a href="${url}">Review securely in the admin portal</a></p>` : ""
  }`;
}

async function sendEmail(connectors: ReplitConnectors, to: string, from: string): Promise<void> {
  const res = await connectors.proxy("resend", "/emails", {
    method: "POST",
    body: { from, to: [to], subject: SUBJECT, text: alertText(), html: alertHtml() },
  });
  if (!res.ok) throw new Error(`resend responded ${res.status}`);
}

async function sendSms(connectors: ReplitConnectors, to: string): Promise<void> {
  const from = process.env["TWILIO_FROM_NUMBER"]?.trim();
  const messagingServiceSid = process.env["TWILIO_MESSAGING_SERVICE_SID"]?.trim();
  if (!from && !messagingServiceSid) throw new Error("twilio sender not configured");

  // Twilio's REST path needs the account SID; look it up, then send.
  const accountRes = await connectors.proxy("twilio", "/2010-04-01/Accounts.json");
  if (!accountRes.ok) throw new Error(`twilio accounts responded ${accountRes.status}`);
  const accountBody = (await accountRes.json().catch(() => null)) as {
    accounts?: Array<{ sid?: unknown }>;
  } | null;
  const accountSid = accountBody?.accounts?.[0]?.sid;
  if (typeof accountSid !== "string" || !accountSid) throw new Error("twilio account unavailable");

  const body = new URLSearchParams({
    To: to,
    Body: alertText(),
    ...(from ? { From: from } : { MessagingServiceSid: messagingServiceSid! }),
  });
  const res = await connectors.proxy("twilio", `/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`twilio messages responded ${res.status}`);
}

/**
 * Alert the clinic that a new request arrived. Fire-and-forget: returns
 * immediately and never throws to the caller. Call it after the request row is
 * committed.
 */
export function notifyNewAppointmentRequest(): void {
  void (async () => {
    const connectors = new ReplitConnectors();
    const from = process.env["NOTIFICATION_EMAIL_FROM"]?.trim();

    for (const to of envList("NOTIFY_EMAILS")) {
      if (!from) break; // no verified sender configured yet
      try {
        await sendEmail(connectors, to, from);
      } catch (err) {
        logger.warn({ err, channel: "email" }, "New-request notification failed");
      }
    }

    for (const to of envList("NOTIFY_PHONES")) {
      try {
        await sendSms(connectors, to);
      } catch (err) {
        logger.warn({ err, channel: "sms" }, "New-request notification failed");
      }
    }
  })();
}
