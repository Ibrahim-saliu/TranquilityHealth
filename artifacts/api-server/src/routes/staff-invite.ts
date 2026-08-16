import { Router, type IRouter } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable, inviteTokensTable, providersTable } from "@workspace/db";
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
    if (!["admin", "collaborator", "provider"].includes(result.invite.role)) {
      res.status(400).json({ valid: false, reason: "wrong_role" });
      return;
    }
    res.json({ valid: true, email: result.invite.email, role: result.invite.role });
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
  if (!["admin", "collaborator", "provider"].includes(invite.role)) {
    res.status(403).json({ error: "This invite link cannot be used to create a staff account" });
    return;
  }

  const email = invite.email.toLowerCase();
  const role = invite.role as "admin" | "collaborator" | "provider";

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

    // Auto-create a blank provider profile linked to this user so the
    // provider dashboard has a record to display immediately.
    if (role === "provider") {
      const [providerRecord] = await db
        .insert(providersTable)
        .values({
          userId: user.id,
          fullName: email.split("@")[0] ?? "New Provider",
          credentials: "",
          licenseState: "TX",
          bio: "",
          isActive: true,
        })
        .returning();

      await writeAuditLog({
        action: "PROVIDER_CREATED",
        entityType: "provider",
        entityId: providerRecord.id,
        actorId: user.id,
        metadata: { via: "invite_acceptance", userId: user.id },
      });
    }

    req.session.userId = user.id;
    req.session.role = user.role;

    req.session.save((saveErr) => {
      if (saveErr) {
        res.status(500).json({ error: "Account creation failed" });
        return;
      }
      res.status(201).json({ user: { id: user.id, email: user.email, role: user.role } });
    });
  } catch (_err) {
    res.status(500).json({ error: "Account creation failed" });
  }
});

export default router;
