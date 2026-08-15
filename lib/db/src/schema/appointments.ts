import { pgTable, text, integer, timestamp, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const appointmentsTable = pgTable("appointments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // FK refs (soft — no hard FK constraint so providers/patients can exist independently)
  patientId: text("patient_id").notNull(),
  providerId: text("provider_id").notNull(),

  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(50),

  // medication_management | psychotherapy | initial_evaluation
  appointmentType: text("appointment_type").notNull().default("medication_management"),

  // scheduled | completed | cancelled | no_show
  status: text("status").notNull().default("scheduled"),

  notes: text("notes"),
}, (t) => [
  check(
    "appointments_status_check",
    sql`${t.status} IN ('scheduled', 'completed', 'cancelled', 'no_show')`,
  ),
  check(
    "appointments_type_check",
    sql`${t.appointmentType} IN ('medication_management', 'psychotherapy', 'initial_evaluation')`,
  ),
]);

export type InsertAppointment = typeof appointmentsTable.$inferInsert;
export type Appointment = typeof appointmentsTable.$inferSelect;
