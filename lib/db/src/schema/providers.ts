import { pgTable, text, boolean, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { usersTable } from "./users";

export const providersTable = pgTable("providers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // FK to users.id — set when a provider user accepts their invite.
  // Nullable so existing placeholder rows without a linked user are preserved.
  // When set, a partial unique index (see table extras) enforces one profile per user.
  userId: text("user_id").references(() => usersTable.id, { onDelete: "set null" }),

  fullName: text("full_name").notNull(),
  credentials: text("credentials").notNull().default(""),
  licenseState: text("license_state").notNull().default("TX"),
  bio: text("bio").notNull().default(""),
  profileImageUrl: text("profile_image_url"),

  isActive: boolean("is_active").notNull().default(true),
}, (t) => [
  // Partial unique index: each user can have at most one provider profile,
  // but NULL userId rows (legacy placeholders) are unrestricted.
  uniqueIndex("providers_user_id_unique")
    .on(t.userId)
    .where(sql`${t.userId} IS NOT NULL`),
]);

export type InsertProvider = typeof providersTable.$inferInsert;
export type Provider = typeof providersTable.$inferSelect;
