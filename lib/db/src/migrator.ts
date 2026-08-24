import type { Pool, PoolClient } from "pg";
import fs from "fs";
import path from "path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

// Journal identity of the baseline migration (migrations/meta/_journal.json,
// entry idx 0). The runtime baselining below compares against this `when`.
const BASELINE_TAG = "0000_baseline";
const BASELINE_WHEN = 1787527281351;

// Fixed key for the session-level advisory lock that serializes migrations
// across concurrently starting instances. Arbitrary but stable.
const MIGRATION_LOCK_KEY = 4927710123456;

// Every table the baseline migration creates. Used to tell a fresh database
// (none present) from a fully push-created one (all present) from a partially
// initialized one (some present) — which we refuse to auto-baseline.
export const BASELINE_TABLES = [
  "appointment_requests",
  "appointments",
  "providers",
  "audit_logs",
  "users",
  "patients",
  "consent_records",
  "invite_tokens",
] as const;

export type BaselineDecision =
  | { action: "fresh" }
  | { action: "baseline" }
  | { action: "partial"; present: string[]; missing: string[] };

/**
 * Decide how to treat a database given which baseline tables already exist.
 * Pure so it can be unit-tested without a database.
 *  - none present → fresh install; let the migrator build from 0000
 *  - all present  → previously created (e.g. via push); mark 0000 applied
 *  - some present → inconsistent; caller must refuse rather than guess
 */
export function decideBaseline(existingTables: Iterable<string>): BaselineDecision {
  const set = existingTables instanceof Set ? existingTables : new Set(existingTables);
  const present = BASELINE_TABLES.filter((t) => set.has(t));
  if (present.length === 0) return { action: "fresh" };
  if (present.length === BASELINE_TABLES.length) return { action: "baseline" };
  return {
    action: "partial",
    present,
    missing: BASELINE_TABLES.filter((t) => !set.has(t)),
  };
}

/**
 * Apply any pending migrations in `migrationsFolder`, idempotently.
 *
 * Handles three starting states safely so it can run unattended on every boot:
 *  - fresh/empty database        → applies 0000_baseline and everything after
 *  - existing DB from `push`      → self-baselines (marks 0000 applied) then
 *                                   applies only later migrations, so it never
 *                                   tries to re-create existing tables
 *  - already-migrated database    → no-op
 *
 * A partially initialized database (some but not all baseline tables) throws,
 * rather than silently skipping the baseline and failing later.
 *
 * The whole baseline+migrate is serialized with a session-level advisory lock
 * held on a dedicated connection, so if several instances start at once only
 * one migrates at a time; the others block, then find nothing left to do.
 */
export interface RunMigrationsOptions {
  /**
   * Allow repairing a partially initialized database by (idempotently) creating
   * the missing baseline table(s) before migrating. OFF by default: normal
   * startup must still refuse a partial database rather than guess. Only the
   * explicit `repair` command turns this on, and only after a backup.
   */
  allowRepair?: boolean;
}

export async function runMigrations(
  pool: Pool,
  migrationsFolder: string,
  opts: RunMigrationsOptions = {},
): Promise<void> {
  const lockClient = await pool.connect();
  try {
    await lockClient.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_KEY]);
    await selfBaselineIfNeeded(lockClient, migrationsFolder, opts.allowRepair ?? false);
    // Use the lock-held client for migration work as well. Besides keeping the
    // critical section on one connection, this avoids deadlocking a pool whose
    // max size is one.
    const db = drizzle(lockClient);
    await migrate(db, { migrationsFolder });
  } finally {
    // Release the lock and return the connection; ignore unlock errors so a
    // failure here never masks a migration error from the try block.
    await lockClient.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_KEY]).catch(() => {});
    lockClient.release();
  }
}

async function listBaselineTables(client: PoolClient): Promise<string[]> {
  const { rows } = await client.query<{ table_name: string }>(
    `select table_name from information_schema.tables
      where table_schema = 'public' and table_name = any($1::text[])`,
    [[...BASELINE_TABLES]],
  );
  return rows.map((r) => r.table_name);
}

// Apply only baseline statements associated with a missing table. The baseline
// contains guarded foreign-key/index statements as well as table definitions;
// replaying every statement would still modify surviving tables.
async function applyMissingBaselineSql(
  client: PoolClient,
  migrationsFolder: string,
  missingTables: string[],
): Promise<void> {
  const sql = fs.readFileSync(path.join(migrationsFolder, `${BASELINE_TAG}.sql`), "utf8");
  const missing = new Set(missingTables);
  for (const stmt of sql.split("--> statement-breakpoint")) {
    const trimmed = stmt.trim();
    if (!trimmed) continue;

    const createTable = trimmed.match(/CREATE TABLE IF NOT EXISTS "([^"]+)"/i);
    if (createTable) {
      if (missing.has(createTable[1])) await client.query(trimmed);
      continue;
    }

    if (missingTables.some((table) => trimmed.includes(`"${table}"`))) {
      await client.query(trimmed);
    }
  }
}

async function applyMigrationSql(
  client: PoolClient,
  migrationsFolder: string,
  tag: string,
): Promise<void> {
  const sql = fs.readFileSync(path.join(migrationsFolder, `${tag}.sql`), "utf8");
  for (const stmt of sql.split("--> statement-breakpoint")) {
    const trimmed = stmt.trim();
    if (trimmed) await client.query(trimmed);
  }
}

async function verifyConsentRecordsFinalSchema(client: PoolClient): Promise<void> {
  const { rows: columns } = await client.query<{ is_nullable: string }>(
    `select is_nullable
       from information_schema.columns
      where table_schema = 'public'
        and table_name = 'consent_records'
        and column_name = 'document_version'`,
  );
  if (columns[0]?.is_nullable !== "NO") {
    throw new Error("Repair did not make consent_records.document_version NOT NULL.");
  }

  const { rows: constraints } = await client.query<{
    conname: string;
    contype: string;
    confdeltype: string | null;
  }>(
    `select c.conname, c.contype, c.confdeltype
       from pg_constraint c
       join pg_class t on t.oid = c.conrelid
       join pg_namespace n on n.oid = t.relnamespace
      where n.nspname = 'public'
        and t.relname = 'consent_records'
        and c.conname in (
          'consent_records_patient_id_patients_id_fk',
          'consent_records_patient_type_version_uq'
        )`,
  );
  const foreignKey = constraints.find(
    (constraint) => constraint.conname === "consent_records_patient_id_patients_id_fk",
  );
  const uniqueConstraint = constraints.find(
    (constraint) => constraint.conname === "consent_records_patient_type_version_uq",
  );
  if (!foreignKey || foreignKey.contype !== "f" || foreignKey.confdeltype !== "r") {
    throw new Error("Repair did not restore the consent_records RESTRICT foreign key.");
  }
  if (!uniqueConstraint || uniqueConstraint.contype !== "u") {
    throw new Error("Repair did not restore consent_records uniqueness.");
  }

  const { rows: triggers } = await client.query<{ tgname: string }>(
    `select tgname
       from pg_trigger
      where tgrelid = 'public.consent_records'::regclass
        and not tgisinternal`,
  );
  const triggerNames = new Set(triggers.map((trigger) => trigger.tgname));
  for (const triggerName of [
    "consent_records_no_update_delete",
    "consent_records_no_truncate",
  ]) {
    if (!triggerNames.has(triggerName)) {
      throw new Error(`Repair did not restore the ${triggerName} trigger.`);
    }
  }
}

async function selfBaselineIfNeeded(
  client: PoolClient,
  migrationsFolder: string,
  allowRepair: boolean,
): Promise<void> {
  let decision = decideBaseline(await listBaselineTables(client));

  if (decision.action === "fresh") return; // migrator builds everything from 0000

  if (decision.action === "partial") {
    if (!allowRepair) {
      throw new Error(
        `Database is partially initialized: found ${decision.present.length}/${BASELINE_TABLES.length} ` +
          `baseline tables (missing: ${decision.missing.join(", ")}). Refusing to auto-baseline. ` +
          `Back up, then run the repair command (see replit.md) to create the missing table(s).`,
      );
    }

    // Repair is explicit and backup-first. Keep restoration and bookkeeping
    // atomic, and only replay baseline statements associated with the missing
    // table(s), never the entire baseline against surviving tables.
    const repairedConsentRecords = decision.missing.includes("consent_records");
    await client.query("BEGIN");
    try {
      await applyMissingBaselineSql(client, migrationsFolder, decision.missing);
      if (repairedConsentRecords) {
        // Migration history may say these migrations already ran even though
        // the table they changed is gone. Reapply their idempotent SQL directly
        // so the recreated table receives the complete final consent schema.
        await applyMigrationSql(client, migrationsFolder, "0001_consent_integrity");
        await applyMigrationSql(client, migrationsFolder, "0002_consent_append_only");
        await applyMigrationSql(client, migrationsFolder, "0003_consent_version_required");
      }

      decision = decideBaseline(await listBaselineTables(client));
      if (decision.action !== "baseline") {
        const missing = decision.action === "partial" ? decision.missing.join(", ") : "unknown";
        throw new Error(`Repair did not produce a complete baseline (still missing: ${missing}).`);
      }
      if (repairedConsentRecords) {
        await verifyConsentRecordsFinalSchema(client);
      }
      await ensureMigrationBookkeeping(client);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    }
    return;
  }

  // decision.action === "baseline": all app tables exist. Ensure the drizzle
  // bookkeeping table exists (same shape the migrator uses) so we can seed it.
  await ensureMigrationBookkeeping(client);
}

async function ensureMigrationBookkeeping(client: PoolClient): Promise<void> {
  await client.query('create schema if not exists "drizzle"');
  await client.query(
    'create table if not exists "drizzle"."__drizzle_migrations" ' +
      "(id serial primary key, hash text not null, created_at bigint)",
  );

  const { rows: cnt } = await client.query<{ n: number }>(
    'select count(*)::int as n from "drizzle"."__drizzle_migrations"',
  );
  if (Number(cnt[0]?.n ?? 0) > 0) return; // already tracked — leave it alone

  // Tables exist but nothing is recorded: this database predates migrations
  // (created with `drizzle-kit push`, or just repaired). Mark the baseline as
  // applied so the migrator skips re-creating existing tables and applies only
  // what's new.
  await client.query(
    'insert into "drizzle"."__drizzle_migrations" (hash, created_at) values ($1, $2)',
    [BASELINE_TAG, BASELINE_WHEN],
  );
}
