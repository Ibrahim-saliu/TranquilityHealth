/**
 * Integration tests that run against a REAL PostgreSQL. They exercise behavior
 * that pure-logic tests can't: the append-only trigger, the unique constraint,
 * the self-baseline path on an existing (push-created) database, and migration
 * locking under concurrent startup.
 *
 * They only run when TEST_DATABASE_URL points at a throwaway Postgres — e.g.
 *   TEST_DATABASE_URL=postgres://postgres@127.0.0.1:55432/thtest \
 *     pnpm --filter @workspace/db run test:run
 * Without it they are skipped, so the normal (no-database) test run is green.
 */
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import pg from "pg";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { runMigrations } from "./migrator";

const { Pool } = pg;
const url = process.env.TEST_DATABASE_URL;
const suite = url ? describe : describe.skip;

const migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), "../migrations");
const pool = url ? new Pool({ connectionString: url }) : (undefined as unknown as pg.Pool);

// Build a temp migrations folder trimmed to entries up to and including
// `upToTag`, so a test can materialize an older schema state (e.g. before the
// NOT NULL migration) and then apply the remaining migrations against it.
function subsetMigrations(upToTag: string): string {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mig-"));
  fs.cpSync(migrationsFolder, tmp, { recursive: true });
  const journalPath = path.join(tmp, "meta/_journal.json");
  const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));
  journal.entries = journal.entries.filter((e: { tag: string }) => e.tag <= upToTag);
  fs.writeFileSync(journalPath, JSON.stringify(journal));
  return tmp;
}

async function resetDatabase() {
  await pool.query("drop schema if exists drizzle cascade");
  await pool.query("drop schema if exists public cascade");
  await pool.query("create schema public");
}

// Insert a patient (and its user) and return the patient id, for consent tests.
async function seedPatient(): Promise<string> {
  await pool.query(
    `insert into users (id, email, password_hash, role) values ('u1', 'p@example.com', 'x', 'patient')`,
  );
  await pool.query(`insert into patients (id, user_id) values ('pt1', 'u1')`);
  return "pt1";
}

async function insertConsent(patientId: string, type = "HIPAA_NOTICE", version = "2025-01") {
  await pool.query(
    `insert into consent_records (id, patient_id, consent_type, document_version)
     values (gen_random_uuid()::text, $1, $2, $3)`,
    [patientId, type, version],
  );
}

suite("migrations + consent enforcement (integration)", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    if (pool) await pool.end();
  });

  it("applies all migrations to a fresh database", async () => {
    await runMigrations(pool, migrationsFolder);
    const { rows } = await pool.query(
      `select count(*)::int as n from information_schema.tables where table_schema='public'`,
    );
    expect(rows[0].n).toBe(8);

    const { rows: trig } = await pool.query(
      `select tgname from pg_trigger where tgrelid='consent_records'::regclass and not tgisinternal order by tgname`,
    );
    expect(trig.map((t) => t.tgname)).toEqual([
      "consent_records_no_truncate",
      "consent_records_no_update_delete",
    ]);
  });

  it("is idempotent — running twice does not error", async () => {
    await runMigrations(pool, migrationsFolder);
    await expect(runMigrations(pool, migrationsFolder)).resolves.toBeUndefined();
  });

  it("self-baselines an existing push-created database", async () => {
    // First migrate to build the schema, then drop only the drizzle tracking
    // schema to simulate a database created by `push` (tables, no history).
    await runMigrations(pool, migrationsFolder);
    await pool.query("drop schema if exists drizzle cascade");

    // Should detect all tables present, stamp the baseline, and apply the rest
    // idempotently without trying to re-create existing objects.
    await expect(runMigrations(pool, migrationsFolder)).resolves.toBeUndefined();

    const { rows } = await pool.query(
      `select is_nullable from information_schema.columns
        where table_name='consent_records' and column_name='document_version'`,
    );
    expect(rows[0].is_nullable).toBe("NO");
  });

  it("refuses to baseline a partially initialized database", async () => {
    // Only one baseline table present → inconsistent state.
    await pool.query(`create table users (id text primary key)`);
    await expect(runMigrations(pool, migrationsFolder)).rejects.toThrow(/partially initialized/i);
  });

  it("startup refuses a 7/8 database missing consent_records; repair fixes it", async () => {
    // Reproduce the reported production-blocker state: all baseline tables
    // except consent_records, and no migration tracking.
    await runMigrations(pool, migrationsFolder);
    await pool.query("drop table if exists consent_records cascade");
    await pool.query("drop schema if exists drizzle cascade");

    const { rows: before } = await pool.query(
      `select count(*)::int as n from information_schema.tables where table_schema='public'`,
    );
    expect(before[0].n).toBe(7);

    // Normal startup must refuse (no allowRepair) rather than guess.
    await expect(runMigrations(pool, migrationsFolder)).rejects.toThrow(/partially initialized/i);

    // Explicit repair creates the missing table and applies migrations.
    await expect(runMigrations(pool, migrationsFolder, { allowRepair: true })).resolves.toBeUndefined();

    // consent_records now exists, fully upgraded: NOT NULL version, unique
    // constraint, and the append-only triggers.
    const { rows: nn } = await pool.query(
      `select is_nullable from information_schema.columns
        where table_name='consent_records' and column_name='document_version'`,
    );
    expect(nn[0].is_nullable).toBe("NO");

    const { rows: uq } = await pool.query(
      `select 1 from pg_constraint where conname='consent_records_patient_type_version_uq'`,
    );
    expect(uq.length).toBe(1);

    const { rows: trig } = await pool.query(
      `select tgname from pg_trigger where tgrelid='consent_records'::regclass and not tgisinternal order by tgname`,
    );
    expect(trig.map((t) => t.tgname)).toEqual([
      "consent_records_no_truncate",
      "consent_records_no_update_delete",
    ]);

    // The other 7 tables were never dropped or recreated.
    const { rows: after } = await pool.query(
      `select count(*)::int as n from information_schema.tables where table_schema='public'`,
    );
    expect(after[0].n).toBe(8);
  });

  it("repair preserves existing data in the surviving tables", async () => {
    await runMigrations(pool, migrationsFolder);
    // Put a row in a table that will survive the partial state.
    await pool.query(
      `insert into users (id, email, password_hash, role) values ('keep', 'keep@example.com', 'x', 'admin')`,
    );
    await pool.query("drop table if exists consent_records cascade");
    await pool.query("drop schema if exists drizzle cascade");

    await runMigrations(pool, migrationsFolder, { allowRepair: true });

    const { rows } = await pool.query(`select email from users where id='keep'`);
    expect(rows[0].email).toBe("keep@example.com");
  });

  it("upgrades legacy duplicate NULL-version consents without a collision", async () => {
    // Materialize the schema as it was *before* 0003 (document_version still
    // nullable, no version backfill yet).
    const pre = subsetMigrations("0002_consent_append_only");
    await runMigrations(pool, pre);

    // Seed the exact hazardous legacy state: two consent rows for the same
    // (patient, consent_type) with NULL version — previously allowed because
    // the unique constraint treats NULLs as distinct.
    await seedPatient();
    await pool.query(
      `insert into consent_records (id, patient_id, consent_type, document_version, signed_at)
       values ('c-old', 'pt1', 'HIPAA_NOTICE', null, now() - interval '2 days'),
              ('c-new', 'pt1', 'HIPAA_NOTICE', null, now() - interval '1 day')`,
    );

    // Applying 0003 must NOT collapse both to 'unversioned' (that would violate
    // the unique constraint and abort). It must relabel deterministically and
    // keep both signatures.
    await expect(runMigrations(pool, migrationsFolder)).resolves.toBeUndefined();

    const { rows } = await pool.query(
      `select id, document_version from consent_records order by signed_at`,
    );
    expect(rows).toEqual([
      { id: "c-old", document_version: "unversioned" },
      { id: "c-new", document_version: "unversioned-2" },
    ]);

    // Column is now NOT NULL and both rows are preserved (append-only).
    const { rows: nn } = await pool.query(
      `select is_nullable from information_schema.columns
        where table_name='consent_records' and column_name='document_version'`,
    );
    expect(nn[0].is_nullable).toBe("NO");
  });

  it("serializes concurrent startups without error", async () => {
    await Promise.all([
      runMigrations(pool, migrationsFolder),
      runMigrations(pool, migrationsFolder),
    ]);
    const { rows } = await pool.query(
      `select count(*)::int as n from information_schema.tables where table_schema='public'`,
    );
    expect(rows[0].n).toBe(8);
  });

  describe("consent_records is append-only + unique", () => {
    beforeEach(async () => {
      await runMigrations(pool, migrationsFolder);
      await seedPatient();
      await insertConsent("pt1");
    });

    it("allows INSERT", async () => {
      await insertConsent("pt1", "TELEHEALTH_CONSENT");
      const { rows } = await pool.query(`select count(*)::int as n from consent_records`);
      expect(rows[0].n).toBe(2);
    });

    it("blocks UPDATE", async () => {
      await expect(
        pool.query(`update consent_records set consent_type='X'`),
      ).rejects.toThrow(/append-only/i);
    });

    it("blocks DELETE", async () => {
      await expect(pool.query(`delete from consent_records`)).rejects.toThrow(/append-only/i);
    });

    it("blocks TRUNCATE", async () => {
      await expect(pool.query(`truncate consent_records`)).rejects.toThrow(/append-only/i);
    });

    it("rejects a duplicate (patient, type, version)", async () => {
      await expect(insertConsent("pt1", "HIPAA_NOTICE", "2025-01")).rejects.toThrow(
        /duplicate key|unique/i,
      );
    });

    it("allows the same consent at a new document version", async () => {
      await insertConsent("pt1", "HIPAA_NOTICE", "2025-02");
      const { rows } = await pool.query(
        `select count(*)::int as n from consent_records where consent_type='HIPAA_NOTICE'`,
      );
      expect(rows[0].n).toBe(2);
    });

    it("blocks deleting a patient who has consent on file (RESTRICT)", async () => {
      await expect(pool.query(`delete from patients where id='pt1'`)).rejects.toThrow(
        /foreign key|violates/i,
      );
    });
  });
});
