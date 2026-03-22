// User role definitions — patient, provider, admin.
// TODO (Phase 3): Roles will be derived from JWT claims or session data.

export type UserRole = "patient" | "provider" | "admin";

export const ROLES = {
  PATIENT: "patient" as UserRole,
  PROVIDER: "provider" as UserRole,
  ADMIN: "admin" as UserRole,
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  patient: "Patient",
  provider: "Provider",
  admin: "Administrator",
};

export function isValidRole(value: unknown): value is UserRole {
  return value === ROLES.PATIENT || value === ROLES.PROVIDER || value === ROLES.ADMIN;
}
