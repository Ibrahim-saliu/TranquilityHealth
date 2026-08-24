import { ReplitConnectors } from "@replit/connectors-sdk";
import { and, eq, inArray, lte, or, sql } from "drizzle-orm";
import {
  adminNotificationRecipientsTable,
  db,
  notificationDeliveriesTable,
} from "@workspace/db";
import { logger } from "./logger";

const MAX_DELIVERY_ATTEMPTS = 5;
const DELIVERY_LEASE_MS = 5 * 60 * 1000;
const PROVIDER_TIMEOUT_MS = 30 * 1000;
const DELIVERY_POLL_MS = 60 * 1000;

type DeliveryChannel = "email" | "sms";

interface ClaimedDelivery {
  id: string;
  recipientId: string;
  channel: DeliveryChannel;
  attemptCount: number;
  leaseToken: string;
}

class NotificationDeliveryError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}

/**
 * Normalize recipient phone input to E.164. Ten digit North American entries
 * are treated as +1; other international inputs must include a country prefix.
 */
export function normalizeNotificationPhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+") && digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

export function getNotificationDeliveryConfig(): {
  emailConfigured: boolean;
  smsConfigured: boolean;
  adminPortalUrlConfigured: boolean;
} {
  return {
    emailConfigured: Boolean(process.env["NOTIFICATION_EMAIL_FROM"]?.trim()),
    smsConfigured: Boolean(
      process.env["TWILIO_FROM_NUMBER"]?.trim() ||
      process.env["TWILIO_MESSAGING_SERVICE_SID"]?.trim(),
    ),
    adminPortalUrlConfigured: Boolean(process.env["ADMIN_PORTAL_URL"]?.trim()),
  };
}

/**
 * A secure portal URL is part of every alert. If any channel lacks its sender
 * or the review URL, pending records remain untouched until configuration is
 * supplied; this preserves alerts created before launch configuration.
 */
export function getDeliverableNotificationChannels(): DeliveryChannel[] {
  const config = getNotificationDeliveryConfig();
  if (!config.adminPortalUrlConfigured) return [];
  return [
    ...(config.emailConfigured ? ["email" as const] : []),
    ...(config.smsConfigured ? ["sms" as const] : []),
  ];
}

export function buildAppointmentRequestAlert(): {
  subject: string;
  text: string;
  html: string;
} {
  const baseUrl = process.env["ADMIN_PORTAL_URL"]?.trim().replace(/\/+$/, "");
  const reviewUrl = baseUrl ? `${baseUrl}/admin/requests` : null;
  const text = [
    "A new appointment request is ready to review in the Tranquility Health admin portal.",
    reviewUrl ? `Review securely: ${reviewUrl}` : "Sign in to the admin portal to review it.",
  ].join("\n\n");

  return {
    subject: "New appointment request ready for review",
    text,
    html: `<p>A new appointment request is ready to review in the Tranquility Health admin portal.</p>${
      reviewUrl
        ? `<p><a href="${reviewUrl}">Review securely in the admin portal</a></p>`
        : "<p>Sign in to the admin portal to review it.</p>"
    }`,
  };
}

export function calculateNextAttemptAt(
  attemptCount: number,
  now = new Date(),
): Date | null {
  if (attemptCount >= MAX_DELIVERY_ATTEMPTS) return null;
  const retryMinutes = [1, 5, 15, 60][Math.min(Math.max(attemptCount - 1, 0), 3)];
  return new Date(now.getTime() + retryMinutes * 60 * 1000);
}

export function buildNotificationDeliveryRows(
  appointmentRequestId: string,
  recipients: Array<{ id: string; email: string | null; phone: string | null }>,
): Array<{
  appointmentRequestId: string;
  recipientId: string;
  channel: DeliveryChannel;
  status: "pending";
  attemptCount: number;
  nextAttemptAt: Date;
}> {
  return recipients.flatMap((recipient) => {
    const channels: DeliveryChannel[] = [
      ...(recipient.email ? ["email" as const] : []),
      ...(recipient.phone ? ["sms" as const] : []),
    ];
    return channels.map((channel) => ({
      appointmentRequestId,
      recipientId: recipient.id,
      channel,
      status: "pending",
      attemptCount: 0,
      nextAttemptAt: new Date(),
    }));
  });
}

function claimableDeliveryWhere(now: Date) {
  return or(
    and(
      inArray(notificationDeliveriesTable.status, ["pending", "failed"]),
      lte(notificationDeliveriesTable.nextAttemptAt, now),
    ),
    and(
      eq(notificationDeliveriesTable.status, "sending"),
      lte(notificationDeliveriesTable.leaseExpiresAt, now),
    ),
  );
}

async function claimNextDelivery(): Promise<ClaimedDelivery | null> {
  const channels = getDeliverableNotificationChannels();
  if (channels.length === 0) return null;

  const now = new Date();
  const [candidate] = await db
    .select({ id: notificationDeliveriesTable.id })
    .from(notificationDeliveriesTable)
    .where(
      and(
        inArray(notificationDeliveriesTable.channel, channels),
        claimableDeliveryWhere(now),
      ),
    )
    .orderBy(notificationDeliveriesTable.createdAt)
    .limit(1);

  if (!candidate) return null;

  const leaseToken = crypto.randomUUID();
  const [claimed] = await db
    .update(notificationDeliveriesTable)
    .set({
      status: "sending",
      attemptCount: sql`${notificationDeliveriesTable.attemptCount} + 1`,
      lastErrorCode: null,
      leaseToken,
      leaseExpiresAt: new Date(now.getTime() + DELIVERY_LEASE_MS),
      updatedAt: now,
    })
    .where(
      and(
        eq(notificationDeliveriesTable.id, candidate.id),
        inArray(notificationDeliveriesTable.channel, channels),
        claimableDeliveryWhere(now),
      ),
    )
    .returning({
      id: notificationDeliveriesTable.id,
      recipientId: notificationDeliveriesTable.recipientId,
      channel: notificationDeliveriesTable.channel,
      attemptCount: notificationDeliveriesTable.attemptCount,
      leaseToken: notificationDeliveriesTable.leaseToken,
    });

  if (
    !claimed ||
    !claimed.leaseToken ||
    (claimed.channel !== "email" && claimed.channel !== "sms")
  ) {
    return null;
  }
  return {
    ...claimed,
    channel: claimed.channel as DeliveryChannel,
    leaseToken: claimed.leaseToken as string,
  };
}

function withProviderTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new NotificationDeliveryError("provider_timeout")),
      PROVIDER_TIMEOUT_MS,
    );
    timer.unref();

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function sendEmail(to: string, idempotencyKey?: string): Promise<string | null> {
  const from = process.env["NOTIFICATION_EMAIL_FROM"]?.trim();
  if (!from) throw new NotificationDeliveryError("email_sender_not_configured");

  const alert = buildAppointmentRequestAlert();
  const connectors = new ReplitConnectors();
  const response = await withProviderTimeout(
    connectors.proxy("resend", "/emails", {
      method: "POST",
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
      body: {
        from,
        to: [to],
        subject: alert.subject,
        text: alert.text,
        html: alert.html,
      },
    }),
  );

  if (!response.ok) throw new NotificationDeliveryError("email_provider_error");
  const body = await response.json().catch(() => null) as { id?: unknown } | null;
  if (typeof body?.id !== "string" || !body.id) {
    throw new NotificationDeliveryError("email_provider_ack_missing");
  }
  return body.id;
}

export async function sendSms(to: string): Promise<string | null> {
  const from = process.env["TWILIO_FROM_NUMBER"]?.trim();
  const messagingServiceSid = process.env["TWILIO_MESSAGING_SERVICE_SID"]?.trim();
  if (!from && !messagingServiceSid) {
    throw new NotificationDeliveryError("sms_sender_not_configured");
  }

  const connectors = new ReplitConnectors();
  const accountResponse = await withProviderTimeout(
    connectors.proxy("twilio", "/2010-04-01/Accounts.json"),
  );
  if (!accountResponse.ok) throw new NotificationDeliveryError("sms_provider_error");

  const accountBody = await accountResponse.json().catch(() => null) as {
    accounts?: Array<{ sid?: unknown }>;
  } | null;
  const accountSid = accountBody?.accounts?.[0]?.sid;
  if (typeof accountSid !== "string" || !accountSid) {
    throw new NotificationDeliveryError("sms_account_unavailable");
  }

  const alert = buildAppointmentRequestAlert();
  const body = new URLSearchParams({
    To: to,
    Body: alert.text,
    ...(from ? { From: from } : { MessagingServiceSid: messagingServiceSid! }),
  });
  const response = await withProviderTimeout(
    connectors.proxy(
      "twilio",
      `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      },
    ),
  );

  if (!response.ok) {
    throw new NotificationDeliveryError(
      response.status >= 500 ? "sms_provider_outcome_unknown" : "sms_send_rejected",
    );
  }
  const responseBody = await response.json().catch(() => null) as { sid?: unknown } | null;
  if (typeof responseBody?.sid !== "string" || !responseBody.sid) {
    throw new NotificationDeliveryError("sms_provider_ack_missing");
  }
  return responseBody.sid;
}

async function deliverClaimedDelivery(delivery: ClaimedDelivery): Promise<void> {
  const [recipient] = await db
    .select({
      email: adminNotificationRecipientsTable.email,
      phone: adminNotificationRecipientsTable.phone,
      isActive: adminNotificationRecipientsTable.isActive,
    })
    .from(adminNotificationRecipientsTable)
    .where(eq(adminNotificationRecipientsTable.id, delivery.recipientId))
    .limit(1);

  if (!recipient || !recipient.isActive) {
    await db
      .update(notificationDeliveriesTable)
      .set({
        status: "cancelled",
        nextAttemptAt: null,
        leaseToken: null,
        leaseExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notificationDeliveriesTable.id, delivery.id),
          eq(notificationDeliveriesTable.leaseToken, delivery.leaseToken),
        ),
      );
    return;
  }

  try {
    const providerMessageId = delivery.channel === "email"
      ? recipient.email
        ? await sendEmail(recipient.email, delivery.id)
        : null
      : recipient.phone
        ? await sendSms(recipient.phone)
        : null;

    if (!providerMessageId && ((delivery.channel === "email" && !recipient.email) || (delivery.channel === "sms" && !recipient.phone))) {
      throw new NotificationDeliveryError("recipient_channel_not_configured");
    }

    await db
      .update(notificationDeliveriesTable)
      .set({
        status: "sent",
        providerMessageId,
        lastErrorCode: null,
        nextAttemptAt: null,
        leaseToken: null,
        leaseExpiresAt: null,
        sentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notificationDeliveriesTable.id, delivery.id),
          eq(notificationDeliveriesTable.leaseToken, delivery.leaseToken),
        ),
      );
  } catch (error) {
    const errorCode = error instanceof NotificationDeliveryError
      ? error.code
      : "provider_request_failed";
    // The connector transport does not expose cancellation. Retrying after a
    // local timeout could create a second SMS while the original request is
    // still in flight, so hold these for manual reconciliation instead.
    const outcomeUnknown =
      errorCode === "provider_timeout" ||
      (delivery.channel === "sms" &&
        [
          "provider_request_failed",
          "sms_provider_outcome_unknown",
          "sms_provider_ack_missing",
        ].includes(errorCode));
    await db
      .update(notificationDeliveriesTable)
      .set({
        status: outcomeUnknown ? "unknown" : "failed",
        lastErrorCode: errorCode,
        nextAttemptAt: outcomeUnknown
          ? null
          : calculateNextAttemptAt(delivery.attemptCount),
        leaseToken: null,
        leaseExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(notificationDeliveriesTable.id, delivery.id),
          eq(notificationDeliveriesTable.leaseToken, delivery.leaseToken),
        ),
      );

    logger.warn(
      {
        deliveryId: delivery.id,
        channel: delivery.channel,
        attemptCount: delivery.attemptCount,
        errorCode,
      },
      "Appointment request notification delivery failed",
    );
  }
}

/**
 * Send a bounded batch. The persisted unique constraint prevents duplicate
 * channel sends for the same request/recipient pair, including after restarts.
 */
export async function processPendingNotificationDeliveries(limit = 25): Promise<void> {
  for (let index = 0; index < limit; index += 1) {
    const delivery = await claimNextDelivery();
    if (!delivery) return;
    await deliverClaimedDelivery(delivery);
  }
}

export function startNotificationDeliveryWorker(): void {
  void processPendingNotificationDeliveries().catch((error) => {
    logger.warn({ err: error }, "Initial notification delivery sweep failed");
  });

  const timer = setInterval(() => {
    void processPendingNotificationDeliveries().catch((error) => {
      logger.warn({ err: error }, "Notification delivery sweep failed");
    });
  }, DELIVERY_POLL_MS);
  timer.unref();
}