-- Append-only enforcement for consent_records at the database level.
-- Signed consent is legal evidence: it may be inserted, but not updated,
-- deleted, or truncated by ordinary DML/DDL. This blocks a stray API route or a
-- routine database session from altering evidence.
--
-- Caveat (see replit.md): a superuser or the table owner can still DISABLE or
-- DROP this trigger, or DROP the table. True tamper-resistance additionally
-- requires the runtime/API to connect as a role that lacks those privileges
-- (privilege separation) — the trigger cannot guarantee it alone.

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
--> statement-breakpoint
DROP TRIGGER IF EXISTS consent_records_no_truncate ON consent_records;
--> statement-breakpoint
CREATE TRIGGER consent_records_no_truncate
BEFORE TRUNCATE ON consent_records
FOR EACH STATEMENT EXECUTE FUNCTION consent_records_block_mutation();
