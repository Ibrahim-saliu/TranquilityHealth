import { pgTable, text, date, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const patientsTable = pgTable("patients", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  // Collected during onboarding — nullable until the patient completes it.
  fullName: text("full_name"),
  dateOfBirth: date("date_of_birth"), // PHI
  phone: text("phone"), // PHI
  address: text("address"), // PHI

  // "pending" | "complete"
  onboardingStatus: text("onboarding_status").notNull().default("pending"),
});

export type InsertPatient = typeof patientsTable.$inferInsert;
export type Patient = typeof patientsTable.$inferSelect;
