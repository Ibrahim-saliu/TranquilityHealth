import { fileURLToPath } from "node:url";
import { pool, runMigrations } from "@workspace/db";
import app, { ensureSessionTable } from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start(): Promise<void> {
  // Bring the database schema up to date before serving traffic. The
  // migrations folder is copied next to the bundled server at build time.
  const migrationsFolder = fileURLToPath(new URL("./migrations", import.meta.url));
  logger.info("Running database migrations");
  await runMigrations(pool, migrationsFolder);

  // Make sure the session table exists before we accept any requests —
  // otherwise every session write fails and authenticated calls 401.
  await ensureSessionTable();

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
