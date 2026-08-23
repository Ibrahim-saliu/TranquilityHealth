/**
 * CLI migration runner — applies pending migrations in ../migrations to the
 * database at DATABASE_URL. Idempotent and safe to run against a fresh, an
 * existing push-created, or an already-migrated database (see runMigrations).
 *
 * Used manually via `pnpm --filter @workspace/db run migrate`. The API server
 * also runs the same runMigrations() automatically at startup.
 */
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import { runMigrations } from "./migrator";

const { Pool } = pg;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set to run migrations");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), "../migrations");

  console.log(`[migrate] applying migrations from ${migrationsFolder}`);
  await runMigrations(pool, migrationsFolder);
  console.log("[migrate] done — database is up to date");

  await pool.end();
}

main().catch((err) => {
  console.error("[migrate] failed:", err);
  process.exit(1);
});
