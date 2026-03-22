/**
 * audit/index.ts — Audit logging utility for Tranquility Health.
 *
 * Provides a reusable logAuditEvent() function for recording security-relevant
 * and compliance-relevant events throughout the platform.
 *
 * In a HIPAA-conscious system, audit logging is required to:
 * - Track who accessed or modified PHI (Protected Health Information)
 * - Record authentication events (login, logout, failed attempts)
 * - Log administrative actions (provider additions, permission changes)
 * - Capture appointment lifecycle events
 *
 * Phase 0: This is a stub. Events are logged to the console only.
 * TODO (Phase 3): Replace console.log with database insertion into the AuditLog model.
 *   The DB schema is defined in prisma/schema.prisma (AuditLog model).
 */

/**
 * AuditAction — the set of valid action types that can be logged.
 *
 * Extend this type as new auditable actions are added in future phases.
 * TODO (Phase 3): Align these with the action types stored in AuditLog.action field.
 */
export type AuditAction =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_CREATED"
  | "USER_ROLE_CHANGED"
  | "PATIENT_CREATED"
  | "PATIENT_RECORD_ACCESSED"       // PHI access event
  | "PATIENT_RECORD_UPDATED"        // PHI modification event
  | "PROVIDER_ADDED"
  | "PROVIDER_DEACTIVATED"
  | "APPOINTMENT_REQUESTED"
  | "APPOINTMENT_SCHEDULED"
  | "APPOINTMENT_CANCELLED"
  | "SESSION_STARTED"
  | "SESSION_ENDED"
  | "CONSENT_SIGNED"
  | "ADMIN_ACTION";

/**
 * AuditMetadata — arbitrary key-value pairs attached to an audit event.
 * Used to store context like resource IDs, IP addresses, and change diffs.
 */
export type AuditMetadata = Record<string, string | number | boolean | null>;

/**
 * logAuditEvent — records a security or compliance event.
 *
 * @param userId   — The ID of the user performing the action (or "system" for automated actions).
 * @param action   — The type of action being recorded (see AuditAction).
 * @param metadata — Optional key-value context for the event (e.g., { resourceId: "appt_123" }).
 *
 * Phase 0: Logs to console only.
 * TODO (Phase 3): Implement DB insertion:
 *   await db.auditLog.create({ data: { userId, action, metadata, timestamp: new Date() } });
 * TODO (Phase compliance): Add IP address capture, session ID, and request correlation ID.
 *
 * @example
 *   logAuditEvent("user_abc123", "PATIENT_RECORD_ACCESSED", { patientId: "pat_456" });
 */
export function logAuditEvent(
  userId: string,
  action: AuditAction,
  metadata?: AuditMetadata,
): void {
  const event = {
    timestamp: new Date().toISOString(),
    userId,
    action,
    metadata: metadata ?? {},
  };

  // Phase 0: Console logging only
  // TODO (Phase 3): Replace with database write:
  //   await db.auditLog.create({ data: event });
  console.log("[AUDIT]", JSON.stringify(event));
}
