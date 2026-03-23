import crypto from "node:crypto";
import { db, inviteTokensTable } from "@workspace/db";
import { writeAuditLog } from "./audit";

const INVITE_EXPIRY_HOURS = 48;

// ---------------------------------------------------------------------------
// Hash a raw token string using SHA-256.
// The hash is stored in DB; the raw token lives only in the invite link.
// ---------------------------------------------------------------------------
function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// ---------------------------------------------------------------------------
// generateInvite — creates a new invite token record and logs the invite URL.
// Returns the raw token (only used to build the link — never stored).
// ---------------------------------------------------------------------------
export async function generateInvite(
  email: string,
  appointmentRequestId?: string,
): Promise<string> {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);

  const [row] = await db
    .insert(inviteTokensTable)
    .values({ email, tokenHash, expiresAt, appointmentRequestId })
    .returning({ id: inviteTokensTable.id });

  await writeAuditLog({
    action: "INVITE_CREATED",
    entityType: "invite_token",
    entityId: row.id,
    metadata: {
      email,
      expiresAt: expiresAt.toISOString(),
      appointmentRequestId: appointmentRequestId ?? null,
    },
  });

  // Log the invite link for the admin to copy and send manually.
  // TODO (Phase 4): Replace console log with email delivery via SendGrid/Resend.
  const baseUrl = process.env["APP_BASE_URL"] ?? "http://localhost:3000";
  console.log(`[INVITE] Link for ${email}: ${baseUrl}/invite/${rawToken}`);

  return rawToken;
}

// ---------------------------------------------------------------------------
// validateInviteToken — looks up and validates a raw token.
// Returns the invite record if valid, null otherwise.
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
