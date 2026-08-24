import type { Pool } from "pg";
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
export async function runMigrations(pool: Pool, migrationsFolder: string): Promise<void> {
  const lockClient = await pool.connect();
  try {
    await lockClient.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_KEY]);
    await selfBaselineIfNeeded(pool);
    const db = drizzle(pool);
    await migrate(db, { migrationsFolder });
  } finally {
    // Release the lock and return the connection; ignore unlock errors so a
    // failure here never masks a migration error from the try block.
    await lockClient.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_KEY]).catch(() => {});
    lockClient.release();
  }
}

async function selfBaselineIfNeeded(pool: Pool): Promise<void> {
  // Which of the expected baseline tables currently exist?
  const { rows } = await pool.query<{ table_name: string }>(
    `select table_name from information_schema.tables
      where table_schema = 'public' and table_name = any($1::text[])`,
    [[...BASELINE_TABLES]],
  );
  const decision = decideBaseline(rows.map((r) => r.table_name));

  if (decision.action === "fresh") return; // migrator builds everything from 0000

  if (decision.action === "partial") {
    throw new Error(
      `Database is partially initialized: found ${decision.present.length}/${BASELINE_TABLES.length} ` +
        `baseline tables (missing: ${decision.missing.join(", ")}). Refusing to auto-baseline. ` +
        `Resolve the database state manually before deploying.`,
    );
  }

  // decision.action === "baseline": all app tables exist. Ensure the drizzle
  // bookkeeping table exists (same shape the migrator uses) so we can seed it.
  await pool.query('create schema if not exists "drizzle"');
  await pool.query(
    'create table if not exists "drizzle"."__drizzle_migrations" ' +
      "(id serial primary key, hash text not null, created_at bigint)",
  );

  const { rows: cnt } = await pool.query<{ n: number }>(
    'select count(*)::int as n from "drizzle"."__drizzle_migrations"',
  );
  if (Number(cnt[0]?.n ?? 0) > 0) return; // already tracked — leave it alone

  // Tables exist but nothing is recorded: this database predates migrations
  // (created with `drizzle-kit push`). Mark the baseline as applied so the
  // migrator skips re-creating existing tables and applies only what's new.
  await pool.query(
    'insert into "drizzle"."__drizzle_migrations" (hash, created_at) values ($1, $2)',
    [BASELINE_TAG, BASELINE_WHEN],
  );
}
