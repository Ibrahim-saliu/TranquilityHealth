import { Router, type IRouter } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable, inviteTokensTable } from "@workspace/db";
import { validateInviteToken } from "../lib/invite";
import { writeAuditLog } from "../lib/audit";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// GET /admin/accept-invite/:token/validate
// Public — validates the token and returns the associated email for the UI.
// ---------------------------------------------------------------------------
router.get("/admin/accept-invite/:token/validate", async (req, res) => {
  const { token } = req.params;
  try {
    const result = await validateInviteToken(token);
    if (!result.valid) {
      res.status(400).json({ valid: false, reason: result.reason });
      return;
    }
    if (!["admin", "collaborator"].includes(result.invite.role)) {
      res.status(400).json({ valid: false, reason: "wrong_role" });
      return;
    }
    res.json({ valid: true, email: result.invite.email });
  } catch (_err) {
    res.status(500).json({ error: "Failed to validate invite" });
  }
});

// ---------------------------------------------------------------------------
// POST /admin/accept-invite/:token
// Public — creates the admin user account from a valid invite token.
// ---------------------------------------------------------------------------
const acceptInviteSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

router.post("/admin/accept-invite/:token", async (req, res) => {
  const { token } = req.params;

  const parsed = acceptInviteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Validation failed" });
    return;
  }

  const result = await validateInviteToken(token);
  if (!result.valid) {
    res.status(400).json({ error: `Invite is ${result.reason.replace(/_/g, " ")}` });
    return;
  }

  const { invite } = result;
  if (!["admin", "collaborator"].includes(invite.role)) {
    res.status(403).json({ error: "This invite link cannot be used to create a staff account" });
    return;
  }

  const email = invite.email.toLowerCase();
  const role = invite.role as "admin" | "collaborator";

  try {
    const [existingUser] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const [user] = await db
      .insert(usersTable)
      .values({ email, passwordHash, role })
      .returning();

    await db
      .update(inviteTokensTable)
      .set({ used: true, usedAt: new Date() })
      .where(eq(inviteTokensTable.id, invite.id));

    await writeAuditLog({
      action: "USER_CREATED",
      entityType: "user",
      entityId: user.id,
      actorId: user.id,
      metadata: { email, role, via: "staff_invite" },
    });

    req.session.userId = user.id;
    req.session.role = user.role;

    res.status(201).json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (_err) {
    res.status(500).json({ error: "Account creation failed" });
  }
});

export default router;
