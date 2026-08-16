// User role definitions. The authoritative role comes from the server session
// (GET /api/auth/me); these constants keep the client's role checks in sync.

export type UserRole = "patient" | "provider" | "admin" | "collaborator";

export const ROLES = {
  PATIENT: "patient" as UserRole,
  PROVIDER: "provider" as UserRole,
  ADMIN: "admin" as UserRole,
  COLLABORATOR: "collaborator" as UserRole,
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  patient: "Patient",
  provider: "Provider",
  admin: "Administrator",
  collaborator: "Collaborator",
};

export function isValidRole(value: unknown): value is UserRole {
  return (
    value === ROLES.PATIENT ||
    value === ROLES.PROVIDER ||
    value === ROLES.ADMIN ||
    value === ROLES.COLLABORATOR
  );
}
