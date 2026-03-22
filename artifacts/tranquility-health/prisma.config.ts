/**
 * prisma.config.ts — Prisma 7 configuration for Tranquility Health.
 *
 * In Prisma 7+, database connection URLs are configured here instead of
 * in schema.prisma. The DATABASE_URL environment variable must be set.
 *
 * See .env.example for the expected DATABASE_URL format.
 *
 * TODO (Phase 3): Consider adding a Prisma Accelerate adapter for edge runtime
 *   support and connection pooling in the deployed environment.
 */

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
