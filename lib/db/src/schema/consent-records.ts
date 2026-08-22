import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { patientsTable } from "./patients";

/**
 * Immutable record of a consent a patient signed (HIPAA notice, telehealth
 * consent, …). Written once at signing; never updated. HIPAA-relevant, so the
 * IP address and signing method are retained for legal purposes.
 */
export const consentRecordsTable = pgTable("consent_records", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  patientId: text("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),

  // e.g. HIPAA_NOTICE | TELEHEALTH_CONSENT
  consentType: text("consent_type").notNull(),
  documentVersion: text("document_version"),

  signatureMethod: text("signature_method").notNull().default("electronic_checkbox"),
  ipAddress: text("ip_address"), // PHI — retained for legal purposes
  signedAt: timestamp("signed_at").defaultNow().notNull(),
});

export type InsertConsentRecord = typeof consentRecordsTable.$inferInsert;
export type ConsentRecord = typeof consentRecordsTable.$inferSelect;
