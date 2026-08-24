import { fileURLToPath } from "node:url";
import { pool, runMigrations } from "@workspace/db";
import app, { ensureSessionTable } from "./app";
import { logger } from "./lib/logger";
import { startNotificationDeliveryWorker } from "./lib/notifications";

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
  // A migration failure must stop startup — serving against an incompatible
  // schema is worse — and must be unmistakable in the deploy logs.
  const migrationsFolder = fileURLToPath(new URL("./migrations", import.meta.url));
  logger.info("Running database migrations");
  try {
    await runMigrations(pool, migrationsFolder);
    logger.info("Database migrations up to date");
  } catch (err) {
    logger.fatal(
      { err },
      "DATABASE MIGRATION FAILED — server will not start. Fix the migration/database state and redeploy; do not retry blindly.",
    );
    process.exit(1);
  }

  // Make sure the session table exists before we accept any requests —
  // otherwise every session write fails and authenticated calls 401.
  await ensureSessionTable();
  startNotificationDeliveryWorker();

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
