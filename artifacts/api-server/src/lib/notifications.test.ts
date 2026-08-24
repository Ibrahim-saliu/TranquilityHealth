import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it, vi } from "vitest";

const { proxyMock } = vi.hoisted(() => ({ proxyMock: vi.fn() }));

vi.mock("@replit/connectors-sdk", () => ({
  ReplitConnectors: class {
    proxy = proxyMock;
  },
}));

import {
  buildNotificationDeliveryRows,
  buildAppointmentRequestAlert,
  calculateNextAttemptAt,
  getDeliverableNotificationChannels,
  getNotificationDeliveryConfig,
  normalizeNotificationPhone,
  sendEmail,
} from "./notifications";

const originalEnvironment = {
  notificationEmailFrom: process.env["NOTIFICATION_EMAIL_FROM"],
  twilioFromNumber: process.env["TWILIO_FROM_NUMBER"],
  twilioMessagingService: process.env["TWILIO_MESSAGING_SERVICE_SID"],
  adminPortalUrl: process.env["ADMIN_PORTAL_URL"],
};

afterEach(() => {
  proxyMock.mockReset();
  for (const [key, value] of Object.entries({
    NOTIFICATION_EMAIL_FROM: originalEnvironment.notificationEmailFrom,
    TWILIO_FROM_NUMBER: originalEnvironment.twilioFromNumber,
    TWILIO_MESSAGING_SERVICE_SID: originalEnvironment.twilioMessagingService,
    ADMIN_PORTAL_URL: originalEnvironment.adminPortalUrl,
  })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("notification recipient normalization", () => {
  it("stores SMS destinations in E.164 form", () => {
    expect(normalizeNotificationPhone("(512) 555-0123")).toBe("+15125550123");
    expect(normalizeNotificationPhone("+44 20 7946 0958")).toBe("+442079460958");
    expect(normalizeNotificationPhone("not-a-number")).toBeNull();
  });
});

describe("privacy-safe appointment-request alerts", () => {
  it("uses only a generic alert and secure portal link", () => {
    process.env["ADMIN_PORTAL_URL"] = "https://portal.example.com/";
    const alert = buildAppointmentRequestAlert();

    expect(alert.subject).toBe("New appointment request ready for review");
    expect(alert.text).toContain("https://portal.example.com/admin/requests");
    expect(alert.text).not.toMatch(/full name|email address|phone number|preferred time/i);
  });

  it("sends a configured transactional email and returns the provider ID", async () => {
    process.env["NOTIFICATION_EMAIL_FROM"] = "Tranquility Health <alerts@example.com>";
    process.env["ADMIN_PORTAL_URL"] = "https://portal.example.com";
    proxyMock.mockResolvedValue(new Response(JSON.stringify({ id: "email_123" }), { status: 200 }));

    await expect(sendEmail("admin@example.com", "delivery_123")).resolves.toBe("email_123");
    expect(proxyMock).toHaveBeenCalledWith(
      "resend",
      "/emails",
      expect.objectContaining({
        method: "POST",
        headers: { "Idempotency-Key": "delivery_123" },
        body: expect.objectContaining({
          to: ["admin@example.com"],
          subject: "New appointment request ready for review",
        }),
      }),
    );
  });

  it("retries when a provider omits its delivery acknowledgement", async () => {
    process.env["NOTIFICATION_EMAIL_FROM"] = "Tranquility Health <alerts@example.com>";
    proxyMock.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

    await expect(sendEmail("admin@example.com")).rejects.toThrow("email_provider_ack_missing");
  });
});

describe("durable delivery behavior", () => {
  it("reports missing sender configuration without attempting provider delivery", () => {
    delete process.env["NOTIFICATION_EMAIL_FROM"];
    delete process.env["TWILIO_FROM_NUMBER"];
    delete process.env["TWILIO_MESSAGING_SERVICE_SID"];
    delete process.env["ADMIN_PORTAL_URL"];

    expect(getNotificationDeliveryConfig()).toEqual({
      emailConfigured: false,
      smsConfigured: false,
      adminPortalUrlConfigured: false,
    });
    expect(getDeliverableNotificationChannels()).toEqual([]);
  });

  it("keeps pending work eligible once senders and a secure portal URL are configured", () => {
    process.env["NOTIFICATION_EMAIL_FROM"] = "Tranquility Health <alerts@example.com>";
    process.env["TWILIO_FROM_NUMBER"] = "+15125550123";
    process.env["ADMIN_PORTAL_URL"] = "https://portal.example.com";

    expect(getDeliverableNotificationChannels()).toEqual(["email", "sms"]);
  });

  it("uses bounded exponential-style retry scheduling", () => {
    const now = new Date("2026-08-24T12:00:00.000Z");
    expect(calculateNextAttemptAt(1, now)?.toISOString()).toBe("2026-08-24T12:01:00.000Z");
    expect(calculateNextAttemptAt(3, now)?.toISOString()).toBe("2026-08-24T12:15:00.000Z");
    expect(calculateNextAttemptAt(5, now)).toBeNull();
  });

  it("keeps the database-level unique delivery key required for duplicate prevention", () => {
    const migrationPath = fileURLToPath(
      new URL("../../../../lib/db/migrations/0004_milky_pride.sql", import.meta.url),
    );
    const migration = readFileSync(migrationPath, "utf8");
    expect(migration).toMatch(
      /CREATE UNIQUE INDEX (IF NOT EXISTS )?"notification_delivery_request_recipient_channel_uq"/,
    );
  });

  it("queues only notification channels that a recipient has configured", () => {
    const rows = buildNotificationDeliveryRows("request_1", [
      { id: "email_only", email: "email@example.test", phone: null },
      { id: "sms_only", email: null, phone: "+15125550123" },
      { id: "both", email: "both@example.test", phone: "+15125550124" },
    ]);

    expect(rows.map((row) => `${row.recipientId}:${row.channel}`)).toEqual([
      "email_only:email",
      "sms_only:sms",
      "both:email",
      "both:sms",
    ]);
  });
});