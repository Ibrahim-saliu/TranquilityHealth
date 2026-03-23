import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { appointmentRequestsTable } from "./appointment-requests";

export const inviteTokensTable = pgTable("invite_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  email: text("email").notNull(),

  // SHA-256 hash of the raw token — raw token is never stored
  tokenHash: text("token_hash").notNull().unique(),

  expiresAt: timestamp("expires_at").notNull(),

  used: boolean("used").notNull().default(false),
  usedAt: timestamp("used_at"),

  // Nullable FK back to the appointment request that triggered this invite
  appointmentRequestId: text("appointment_request_id")
    .references(() => appointmentRequestsTable.id, { onDelete: "set null" }),
});

export type InsertInviteToken = typeof inviteTokensTable.$inferInsert;
export type InviteToken = typeof inviteTokensTable.$inferSelect;
