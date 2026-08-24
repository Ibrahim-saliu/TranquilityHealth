import { check, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { appointmentRequestsTable } from "./appointment-requests";
import { adminNotificationRecipientsTable } from "./admin-notification-recipients";

/**
 * Persistent notification outbox. It never stores the notification body or
 * patient/request details; only routing and delivery state are retained.
 */
export const notificationDeliveriesTable = pgTable("notification_deliveries", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  appointmentRequestId: text("appointment_request_id")
    .notNull()
    .references(() => appointmentRequestsTable.id, { onDelete: "cascade" }),
  recipientId: text("recipient_id")
    .notNull()
    .references(() => adminNotificationRecipientsTable.id, { onDelete: "restrict" }),

  channel: text("channel").notNull(),
  status: text("status").notNull().default("pending"),
  attemptCount: integer("attempt_count").notNull().default(0),
  leaseToken: text("lease_token"),
  leaseExpiresAt: timestamp("lease_expires_at"),
  providerMessageId: text("provider_message_id"),
  lastErrorCode: text("last_error_code"),
  nextAttemptAt: timestamp("next_attempt_at").defaultNow(),
  sentAt: timestamp("sent_at"),
}, (t) => [
  check(
    "notification_deliveries_channel_check",
    sql`${t.channel} IN ('email', 'sms')`,
  ),
  check(
    "notification_deliveries_status_check",
    sql`${t.status} IN ('pending', 'sending', 'sent', 'failed', 'unknown', 'cancelled')`,
  ),
  uniqueIndex("notification_delivery_request_recipient_channel_uq")
    .on(t.appointmentRequestId, t.recipientId, t.channel),
]);

export type InsertNotificationDelivery = typeof notificationDeliveriesTable.$inferInsert;
export type NotificationDelivery = typeof notificationDeliveriesTable.$inferSelect;