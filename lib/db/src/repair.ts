/**
 * Deliberate database repair for a PARTIALLY initialized database — one that is
 * missing one or more baseline tables (e.g. `consent_records`), which the normal
 * startup migrator refuses to touch.
 *
 * This creates ONLY the missing baseline table(s) (idempotent CREATE IF NOT
 * EXISTS — existing tables and their data are never dropped or overwritten),
 * then applies all pending migrations. It is intentionally gated:
 *
 *   1. Take a database backup first.
 *   2. Run with an explicit confirmation:
 *        CONFIRM_DB_REPAIR=1 DATABASE_URL=... \
 *          pnpm --filter @workspace/db run repair
 *
 * Without CONFIRM_DB_REPAIR=1 it refuses to run.
 */
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import { runMigrations } from "./migrator";

const { Pool } = pg;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set to run the repair");
  }
  if (process.env.CONFIRM_DB_REPAIR !== "1") {
    throw new Error(
      "Refusing to run repair without confirmation. Back up the database first, " +
        "then re-run with CONFIRM_DB_REPAIR=1.",
    );
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), "../migrations");

  try {
    console.log("[repair] creating any missing baseline tables, then migrating…");
    await runMigrations(pool, migrationsFolder, { allowRepair: true });
    console.log("[repair] done — database is complete and up to date");
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[repair] failed:", err);
  process.exit(1);
});
