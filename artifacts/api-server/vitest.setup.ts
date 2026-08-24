// Some units under test import from `@workspace/db`, whose client throws at
// import time if DATABASE_URL is unset. These tests are pure-logic and never
// query the database (the pg Pool is created lazily), so provide a placeholder
// connection string when none is set to keep the no-database test run green.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgres://placeholder:placeholder@127.0.0.1:5432/placeholder";
}
