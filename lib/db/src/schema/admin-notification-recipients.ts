import { boolean, check, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Clinic-owned destinations for operational appointment-request alerts.
 * These contacts are intentionally separate from provider profiles and user
 * accounts so one or more administrators can receive both channels.
 */
export const adminNotificationRecipientsTable = pgTable("admin_notification_recipients", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  label: text("label").notNull(),
  email: text("email"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
}, (t) => [
  check(
    "admin_notification_recipient_contact_check",
    sql`${t.email} IS NOT NULL OR ${t.phone} IS NOT NULL`,
  ),
]);

export type InsertAdminNotificationRecipient = typeof adminNotificationRecipientsTable.$inferInsert;
export type AdminNotificationRecipient = typeof adminNotificationRecipientsTable.$inferSelect;