---
name: Isolated PostgreSQL testing
description: Environment-specific setup needed to run the database integration suite without touching development data.
---

Run database integration tests against a temporary local PostgreSQL cluster, not the development database, because the suite resets `public` and `drizzle` schemas.

**Why:** The environment has PostgreSQL 16 binaries but no `/run/postgresql` socket directory and no `USER` environment variable. Default startup fails, and scripts that assume `$USER` fail under strict shell settings.

**How to apply:** Initialize under `/tmp`, create a socket directory there, pass it with PostgreSQL's `-k` option, connect over `127.0.0.1`, and obtain the database user with `id -un`. Always stop and remove the temporary cluster after tests.