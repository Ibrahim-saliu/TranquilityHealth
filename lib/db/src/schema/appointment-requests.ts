import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const appointmentRequestsTable = pgTable("appointment_requests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  // PII: contact info from public intake form
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),

  preferredTime: text("preferred_time").notNull(),
  serviceInterest: text("service_interest").notNull(), // therapy | medication | not_sure
  preferredContactMethod: text("preferred_contact_method"),  // phone | email
  isNewPatient: boolean("is_new_patient"),
  contactConsent: boolean("contact_consent").notNull().default(false),

  // Admin tracking
  status: text("status").notNull().default("new"), // new | reviewed | converted | declined
  reviewedAt: timestamp("reviewed_at"),
  reviewedByAdminId: text("reviewed_by_admin_id"),

  // Phase 3: optional FK after account creation
  patientId: text("patient_id"),
  convertedToAppointmentId: text("converted_to_appointment_id"),
});

export type InsertAppointmentRequest = typeof appointmentRequestsTable.$inferInsert;
export type AppointmentRequest = typeof appointmentRequestsTable.$inferSelect;
