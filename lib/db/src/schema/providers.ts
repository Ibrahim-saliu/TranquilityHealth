import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const providersTable = pgTable("providers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  fullName: text("full_name").notNull(),
  credentials: text("credentials").notNull().default(""),
  licenseState: text("license_state").notNull().default("TX"),
  bio: text("bio").notNull().default(""),
  profileImageUrl: text("profile_image_url"),

  isActive: boolean("is_active").notNull().default(true),
});

export type InsertProvider = typeof providersTable.$inferInsert;
export type Provider = typeof providersTable.$inferSelect;
