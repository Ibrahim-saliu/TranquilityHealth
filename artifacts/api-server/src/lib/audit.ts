import { db, auditLogsTable } from "@workspace/db";

export type AuditAction =
  | "REQUEST_STATUS_UPDATED"
  | "PROVIDER_PROFILE_UPDATED"
  | "PROVIDER_PLACEHOLDER_SEEDED"
  | "PROVIDER_CREATED"
  | "PROVIDER_UPDATED"
  | "PROVIDER_SELF_UPDATED"
  | "APPOINTMENT_SCHEDULED"
  | "ONBOARDING_COMPLETED"
  // Phase 3: auth + invite events
  | "INVITE_CREATED"
  | "INVITE_USED"
  | "USER_CREATED"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE";

interface AuditParams {
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Record<string, string | number | boolean | null>;
  actorId?: string;
}

export async function writeAuditLog(params: AuditParams): Promise<void> {
  const { action, entityType, entityId, metadata, actorId = "system" } = params;
  try {
    await db.insert(auditLogsTable).values({
      actorId,
      action,
      entityType,
      entityId,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });
  } catch (err) {
    // Audit log failure must never crash the main request
    console.error("[AUDIT] Failed to write audit log:", err);
  }
}
