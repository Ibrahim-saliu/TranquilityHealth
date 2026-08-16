import { pgTable, text, integer, timestamp, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { patientsTable } from "./patients";
import { providersTable } from "./providers";

export const appointmentsTable = pgTable("appointments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // Enforced foreign keys — an appointment must reference a real patient and
  // provider. "restrict" prevents deleting either while appointments exist,
  // which is the safe default for clinical records.
  patientId: text("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "restrict" }),
  providerId: text("provider_id")
    .notNull()
    .references(() => providersTable.id, { onDelete: "restrict" }),

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
