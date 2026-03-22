/**
 * roles.ts — Role type definitions for Tranquility Health.
 *
 * Defines the three core user roles in the system. These are used across:
 * - TypeScript type annotations
 * - Route protection logic (Phase 3)
 * - Database schema (role field on User model)
 * - UI conditional rendering
 *
 * TODO (Phase 3): Integrate with authentication system — roles will be
 *   derived from the authenticated user's JWT claims or session data.
 */

/**
 * UserRole — the set of valid user roles in the platform.
 *
 * - patient: An individual receiving mental health services.
 * - provider: A licensed clinician (therapist, NP, psychiatrist).
 * - admin: An internal staff member managing the platform.
 */
export type UserRole = "patient" | "provider" | "admin";

/**
 * Role enum-style constants for use in comparisons and switch statements.
 * Prefer these constants over raw strings to avoid typos.
 */
export const ROLES = {
  PATIENT: "patient" as UserRole,
  PROVIDER: "provider" as UserRole,
  ADMIN: "admin" as UserRole,
} as const;

/**
 * RoleLabel — human-readable display names for each role.
 * Used in admin UI and user profile displays.
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  patient: "Patient",
  provider: "Provider",
  admin: "Administrator",
};

/**
 * isValidRole — type guard to check if a string is a valid UserRole.
 * Use this when validating untrusted input (e.g., API responses).
 *
 * @example
 *   if (isValidRole(user.role)) { ... }
 */
export function isValidRole(value: unknown): value is UserRole {
  return value === ROLES.PATIENT || value === ROLES.PROVIDER || value === ROLES.ADMIN;
}
