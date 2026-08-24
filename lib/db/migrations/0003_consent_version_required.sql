-- Make document_version mandatory so the unique (patient, type, version)
-- constraint can't be bypassed with NULLs (Postgres treats NULLs as distinct).
-- Backfill any legacy/unversioned rows first. The append-only trigger blocks
-- UPDATE, so disable it just for the backfill, then restore it.
ALTER TABLE "consent_records" DISABLE TRIGGER "consent_records_no_update_delete";
--> statement-breakpoint
UPDATE "consent_records" SET "document_version" = 'unversioned' WHERE "document_version" IS NULL;
--> statement-breakpoint
ALTER TABLE "consent_records" ENABLE TRIGGER "consent_records_no_update_delete";
--> statement-breakpoint
ALTER TABLE "consent_records" ALTER COLUMN "document_version" SET NOT NULL;
