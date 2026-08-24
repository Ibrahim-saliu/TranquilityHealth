-- Idempotent: safe to apply whether or not these objects already exist (e.g. a
-- database previously created with `drizzle-kit push` of the current schema).
ALTER TABLE "consent_records" DROP CONSTRAINT IF EXISTS "consent_records_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" DROP CONSTRAINT IF EXISTS "consent_records_patient_type_version_uq";
--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_patient_type_version_uq" UNIQUE("patient_id","consent_type","document_version");
