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
import path from "path";
import { fileURLToPath } from "url";
import { runMigrations } from "./migrator";

const { Pool } = pg;
const url = process.env.TEST_DATABASE_URL;
const suite = url ? describe : describe.skip;

const migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), "../migrations");
const pool = url ? new Pool({ connectionString: url }) : (undefined as unknown as pg.Pool);

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
