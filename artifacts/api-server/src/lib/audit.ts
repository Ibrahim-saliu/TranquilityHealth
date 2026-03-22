import { db, auditLogsTable } from "@workspace/db";

export type AuditAction =
  | "REQUEST_STATUS_UPDATED"
  | "PROVIDER_PROFILE_UPDATED";

interface AuditParams {
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Record<string, string | number | boolean | null>;
  // TODO (Phase 3): Replace with real authenticated admin user id
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
