// Audit logging stub — Phase 0. TODO (Phase 3): replace with DB write to AuditLog table.

export type AuditAction =
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_CREATED"
  | "USER_ROLE_CHANGED"
  | "PATIENT_CREATED"
  | "PATIENT_RECORD_ACCESSED"
  | "PATIENT_RECORD_UPDATED"
  | "PROVIDER_ADDED"
  | "PROVIDER_DEACTIVATED"
  | "APPOINTMENT_REQUESTED"
  | "APPOINTMENT_SCHEDULED"
  | "APPOINTMENT_CANCELLED"
  | "SESSION_STARTED"
  | "SESSION_ENDED"
  | "CONSENT_SIGNED"
  | "ADMIN_ACTION";

export type AuditMetadata = Record<string, string | number | boolean | null>;

// TODO (Phase 3): await db.auditLog.create({ data: { userId, action, metadata } });
export function logAuditEvent(
  userId: string,
  action: AuditAction,
  metadata?: AuditMetadata,
): void {
  console.log("[AUDIT]", JSON.stringify({ timestamp: new Date().toISOString(), userId, action, metadata }));
}
