/**
 * Migration runner — applies any pending SQL migrations in ../migrations to the
 * database at DATABASE_URL, tracked in the drizzle __drizzle_migrations table.
 * Idempotent: already-applied migrations are skipped. Run in deploy via
 * `pnpm --filter @workspace/db run migrate`.
 *
 * NOTE for an existing database first adopting migrations: if the schema was
 * previously created with `drizzle-kit push`, baseline it before the first run
 * so migrate doesn't try to re-create existing tables — see replit.md.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set to run migrations");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  const migrationsFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), "../migrations");

  console.log(`[migrate] applying migrations from ${migrationsFolder}`);
  await migrate(db, { migrationsFolder });
  console.log("[migrate] done — database is up to date");

  await pool.end();
}

main().catch((err) => {
  console.error("[migrate] failed:", err);
  process.exit(1);
});
