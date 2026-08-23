-- Enforce append-only semantics on consent_records at the database level.
-- Signed consent is legal evidence: it may be inserted, but never updated or
-- deleted — regardless of the API route or database user performing the write.
-- (The FK RESTRICT already blocks deletion via patient/user cascade; this also
-- blocks a direct UPDATE or DELETE on a consent row.)

CREATE OR REPLACE FUNCTION consent_records_block_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'consent_records is append-only: % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DROP TRIGGER IF EXISTS consent_records_no_update_delete ON consent_records;
--> statement-breakpoint
CREATE TRIGGER consent_records_no_update_delete
BEFORE UPDATE OR DELETE ON consent_records
FOR EACH ROW EXECUTE FUNCTION consent_records_block_mutation();
