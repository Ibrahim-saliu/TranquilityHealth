import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),

  // "patient" | "admin" — provider role deferred to future phase
  role: text("role").notNull().default("patient"),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;
