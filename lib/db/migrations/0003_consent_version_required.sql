-- Make document_version mandatory so the unique (patient, type, version)
-- constraint can't be bypassed with NULLs (Postgres treats NULLs as distinct).
--
-- Backfilling legacy NULLs is not a blind SET: because NULLs were previously
-- allowed and treated as distinct, a patient could have MORE THAN ONE
-- null-version row for the same consent type. Collapsing them all to a single
-- 'unversioned' value would collide with the unique (patient, type, version)
-- constraint and abort the deploy. Consent is append-only legal evidence, so we
-- never drop the duplicates — instead each null-version row gets a distinct,
-- deterministic label: the earliest (by signed_at, then created_at, then id)
-- keeps 'unversioned'; subsequent ones become 'unversioned-2', 'unversioned-3',
-- … preserving every signature while satisfying uniqueness.
--
-- The append-only trigger blocks UPDATE, so disable it just for the backfill.
ALTER TABLE "consent_records" DISABLE TRIGGER "consent_records_no_update_delete";
--> statement-breakpoint
WITH ranked AS (
  SELECT
    "id",
    row_number() OVER (
      PARTITION BY "patient_id", "consent_type"
      ORDER BY "signed_at", "created_at", "id"
    ) AS rn
  FROM "consent_records"
  WHERE "document_version" IS NULL
)
UPDATE "consent_records" c
SET "document_version" = CASE WHEN r.rn = 1 THEN 'unversioned' ELSE 'unversioned-' || r.rn END
FROM ranked r
WHERE c."id" = r."id";
--> statement-breakpoint
ALTER TABLE "consent_records" ENABLE TRIGGER "consent_records_no_update_delete";
--> statement-breakpoint
ALTER TABLE "consent_records" ALTER COLUMN "document_version" SET NOT NULL;
