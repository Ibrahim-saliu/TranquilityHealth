import { pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { patientsTable } from "./patients";

/**
 * Immutable record of a consent a patient signed (HIPAA notice, telehealth
 * consent, …). Written once at signing; never updated. HIPAA-relevant, so the
 * IP address and signing method are retained for legal purposes.
 *
 * The FK uses ON DELETE RESTRICT (not cascade): signed consent is legal
 * evidence and must not be erasable by deleting the patient (or the user the
 * patient cascades from). A patient with consent records on file can't be
 * hard-deleted — that's intentional.
 */
export const consentRecordsTable = pgTable("consent_records", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at").defaultNow().notNull(),

  patientId: text("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "restrict" }),

  // e.g. HIPAA_NOTICE | TELEHEALTH_CONSENT
  consentType: text("consent_type").notNull(),
  documentVersion: text("document_version"),

  signatureMethod: text("signature_method").notNull().default("electronic_checkbox"),
  ipAddress: text("ip_address"), // PHI — retained for legal purposes
  signedAt: timestamp("signed_at").defaultNow().notNull(),
}, (t) => [
  // One signature per patient per consent document version. Prevents duplicate
  // records from concurrent submissions and lets a new document version be
  // captured as a distinct signature rather than silently skipped.
  unique("consent_records_patient_type_version_uq").on(t.patientId, t.consentType, t.documentVersion),
]);

export type InsertConsentRecord = typeof consentRecordsTable.$inferInsert;
export type ConsentRecord = typeof consentRecordsTable.$inferSelect;
