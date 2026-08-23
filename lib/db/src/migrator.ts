import type { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

// Journal identity of the baseline migration (migrations/meta/_journal.json,
// entry idx 0). The runtime baselining below compares against this `when`.
const BASELINE_TAG = "0000_baseline";
const BASELINE_WHEN = 1787527281351;

/**
 * Apply any pending migrations in `migrationsFolder`, idempotently.
 *
 * Handles three starting states safely so it can run unattended on every boot:
 *  - fresh/empty database        → applies 0000_baseline and everything after
 *  - existing DB from `push`      → self-baselines (marks 0000 applied) then
 *                                   applies only later migrations, so it never
 *                                   tries to re-create existing tables
 *  - already-migrated database    → no-op
 */
export async function runMigrations(pool: Pool, migrationsFolder: string): Promise<void> {
  await selfBaselineIfNeeded(pool);
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder });
}

async function selfBaselineIfNeeded(pool: Pool): Promise<void> {
  // If the app schema doesn't exist yet, this is a fresh database — let the
  // migrator build it from the baseline. Nothing to baseline.
  const { rows: reg } = await pool.query<{ reg: string | null }>(
    "select to_regclass('public.users') as reg",
  );
  if (reg[0]?.reg == null) return;

  // App tables exist. Ensure the drizzle bookkeeping table exists (same shape
  // the migrator uses) so we can inspect and seed it.
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
  // (it was created with `drizzle-kit push`). Mark the baseline as applied so
  // the migrator skips re-creating existing tables and applies only what's new.
  await pool.query(
    'insert into "drizzle"."__drizzle_migrations" (hash, created_at) values ($1, $2)',
    [BASELINE_TAG, BASELINE_WHEN],
  );
}
