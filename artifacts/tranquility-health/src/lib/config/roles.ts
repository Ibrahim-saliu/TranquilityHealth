// Role configuration — re-exports from types/roles.ts plus route mapping constants.

import { ROLES, ROLE_LABELS, type UserRole } from "@/types/roles";

export { ROLES, ROLE_LABELS };
export type { UserRole };

// TODO (Phase 3): Use for redirect-after-login routing.
export const ROLE_ROUTE_PREFIXES: Record<UserRole, string> = {
  patient: "/app",
  provider: "/admin",
  admin: "/admin",
  collaborator: "/admin",
};

// TODO (Phase 3): Wire into route protection middleware.
export const PROTECTED_ROLE_ROUTES: Record<string, UserRole> = {
  "/app": "patient",
  "/admin": "admin",
};
