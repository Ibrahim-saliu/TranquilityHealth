import crypto from "node:crypto";
import { db, inviteTokensTable } from "@workspace/db";
import { writeAuditLog } from "./audit";

const INVITE_EXPIRY_HOURS = 72;

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// ---------------------------------------------------------------------------
// generateInvite — creates a new invite token record and returns the raw token.
// role defaults to "admin" — the only active invite flow is staff onboarding.
// ---------------------------------------------------------------------------
export async function generateInvite(
  email: string,
  role: "admin" | "collaborator" | "patient" | "provider" = "admin",
  appointmentRequestId?: string,
): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

  const [row] = await db
    .insert(inviteTokensTable)
    .values({ email, tokenHash, expiresAt, role, appointmentRequestId })
    .returning({ id: inviteTokensTable.id });

  await writeAuditLog({
    action: "INVITE_CREATED",
    entityType: "invite_token",
    entityId: row.id,
    metadata: {
      email,
      role,
      expiresAt: expiresAt.toISOString(),
      appointmentRequestId: appointmentRequestId ?? null,
    },
  });

  const baseUrl = process.env["APP_BASE_URL"] ?? "http://localhost:3000";
  console.log(`[INVITE] ${role} invite for ${email}: ${baseUrl}/admin/accept-invite/${rawToken}`);

  return rawToken;
}

// ---------------------------------------------------------------------------
// validateInviteToken — looks up and validates a raw token.
// ---------------------------------------------------------------------------
export async function validateInviteToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const { eq } = await import("drizzle-orm");
  const [invite] = await db
    .select()
    .from(inviteTokensTable)
    .where(eq(inviteTokensTable.tokenHash, tokenHash));

  if (!invite) return { valid: false as const, reason: "not_found" as const };
  if (invite.used) return { valid: false as const, reason: "already_used" as const };
  if (invite.expiresAt < new Date()) return { valid: false as const, reason: "expired" as const };

  return { valid: true as const, invite };
}
