import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const patientsTable = pgTable("patients", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  // Collected during onboarding — nullable until Phase 4
  fullName: text("full_name"),

  // "pending" | "complete" — extended in Phase 4
  onboardingStatus: text("onboarding_status").notNull().default("pending"),
});

export type InsertPatient = typeof patientsTable.$inferInsert;
export type Patient = typeof patientsTable.$inferSelect;
