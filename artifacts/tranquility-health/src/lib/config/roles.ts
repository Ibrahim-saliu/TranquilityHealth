/**
 * lib/config/roles.ts — Role configuration constants.
 *
 * Centralizes role definitions for use across config imports.
 * See also src/types/roles.ts for TypeScript type definitions and utility functions.
 *
 * This file exists under lib/config so that role constants can be imported
 * alongside other config (routes, env flags) via @/lib/config.
 */

import { ROLES, ROLE_LABELS, type UserRole } from "@/types/roles";

export { ROLES, ROLE_LABELS };
export type { UserRole };

/**
 * ROLE_ROUTE_PREFIXES — maps each role to the route prefix they primarily access.
 * Used for redirect-after-login logic in Phase 3.
 *
 * TODO (Phase 3): Use these in the auth middleware to redirect users to their
 *   appropriate home route after successful login.
 */
export const ROLE_ROUTE_PREFIXES: Record<UserRole, string> = {
  patient: "/app",
  provider: "/app",
  admin: "/admin",
};

/**
 * PROTECTED_ROLE_ROUTES — maps route prefixes to the role required to access them.
 * TODO (Phase 3): Wire these into the route protection middleware.
 */
export const PROTECTED_ROLE_ROUTES: Record<string, UserRole> = {
  "/app": "patient",
  "/admin": "admin",
};
