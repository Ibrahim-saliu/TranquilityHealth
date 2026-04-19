/**
 * seed-admin.ts
 *
 * One-time bootstrap script to create the first admin account.
 * Run this after deploying to a fresh environment.
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=YourPassword123! \
 *     pnpm --filter @workspace/api-server tsx scripts/seed-admin.ts
 *
 * The script is idempotent — if an admin already exists it exits cleanly.
 */

import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

const email = process.env["ADMIN_EMAIL"]?.toLowerCase().trim();
const password = process.env["ADMIN_PASSWORD"]?.trim();

if (!email || !password) {
  console.error("ERROR: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.");
  process.exit(1);
}

if (password.length < 8) {
  console.error("ERROR: ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

async function run() {
  const [existingAdmin] = await db
    .select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.role, "admin"))
    .limit(1);

  if (existingAdmin) {
    console.log(`Admin already exists: ${existingAdmin.email} — no changes made.`);
    process.exit(0);
  }

  const [existingEmail] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existingEmail) {
    console.error(`ERROR: A user with email "${email}" already exists but is not an admin.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(usersTable)
    .values({ email, passwordHash, role: "admin" })
    .returning({ id: usersTable.id, email: usersTable.email });

  console.log(`Admin account created successfully:`);
  console.log(`  ID:    ${user.id}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Role:  admin`);
  console.log(`\nYou can now log in at /login`);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
