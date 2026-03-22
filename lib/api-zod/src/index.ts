// Zod schemas (primary export — use for validation and z.infer<> typing)
export * from "./generated/api";
// TypeScript type aliases generated alongside schemas.
// Namespaced to avoid TS2308 duplicate-export collision: orval v8 generates
// both a `const Schema = zod.object(...)` in api.ts and a `type Schema = {...}`
// in types/, causing a name clash under `export *`. The only current consumer
// (health.ts) imports HealthCheckResponse from api.ts, so this is safe.
export * as zodTypes from "./generated/types";
