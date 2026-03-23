import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const inviteTokensTable = pgTable("invite_tokens", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  email: text("email").notNull(),

  // SHA-256 hash of the raw token — raw token is never stored
  tokenHash: text("token_hash").notNull().unique(),

  expiresAt: timestamp("expires_at").notNull(),

  used: boolean("used").notNull().default(false),
  usedAt: timestamp("used_at"),

  // Optional link back to the appointment request that triggered this invite
  appointmentRequestId: text("appointment_request_id"),
});

export type InsertInviteToken = typeof inviteTokensTable.$inferInsert;
export type InviteToken = typeof inviteTokensTable.$inferSelect;
