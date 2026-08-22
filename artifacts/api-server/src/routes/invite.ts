import { Router, type IRouter } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable, patientsTable, inviteTokensTable } from "@workspace/db";
import { validateInviteToken } from "../lib/invite";
import { writeAuditLog } from "../lib/audit";

const router: IRouter = Router();

const BCRYPT_ROUNDS = 12;

// ---------------------------------------------------------------------------
// GET /api/invite/:token
// Validates the token and returns the associated email if valid.
// ---------------------------------------------------------------------------
router.get("/invite/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const result = await validateInviteToken(token);
    if (!result.valid) {
      res.status(400).json({ valid: false, reason: result.reason });
      return;
    }
    res.json({ valid: true, email: result.invite.email });
  } catch (_err) {
    res.status(500).json({ error: "Failed to validate invite" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/invite/:token/accept
// Creates a User + Patient record, marks token used, auto-logs in.
// ---------------------------------------------------------------------------
const acceptSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

router.post("/invite/:token/accept", async (req, res) => {
  const { token } = req.params;

  const parsed = acceptSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }

  try {
    const result = await validateInviteToken(token);
    if (!result.valid) {
      res.status(400).json({ error: `Invite is ${result.reason.replace(/_/g, " ")}` });
      return;
    }

    const { invite } = result;
    const { password } = parsed.data;
    const email = invite.email.toLowerCase();

    // Check if this email already has an account
    const [existingUser] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create User
    const [user] = await db
      .insert(usersTable)
      .values({ email, passwordHash, role: "patient" })
      .returning();

    await writeAuditLog({
      action: "USER_CREATED",
      entityType: "user",
      entityId: user.id,
      actorId: user.id,
      metadata: { email, via: "invite" },
    });

    // Create Patient linked to User
    const [patient] = await db
      .insert(patientsTable)
      .values({ userId: user.id, onboardingStatus: "pending" })
      .returning({ id: patientsTable.id });

    // Mark invite token as used
    await db
      .update(inviteTokensTable)
      .set({ used: true, usedAt: new Date() })
      .where(eq(inviteTokensTable.id, invite.id));

    await writeAuditLog({
      action: "INVITE_USED",
      entityType: "invite_token",
      entityId: invite.id,
      actorId: user.id,
      metadata: { email, patientId: patient.id },
    });

    // Auto-login: set session, then persist before responding so the client's
    // next request finds it (explicit save for the async Postgres store).
    req.session.userId = user.id;
    req.session.role = user.role;

    req.session.save((saveErr) => {
      if (saveErr) {
        res.status(500).json({ error: "Account creation failed" });
        return;
      }
      // Name is null and onboarding is pending at account creation — both are
      // set when the patient completes onboarding.
      res.status(201).json({
        user: { id: user.id, email: user.email, role: user.role, name: null, onboardingStatus: "pending" },
      });
    });
  } catch (_err) {
    res.status(500).json({ error: "Account creation failed" });
  }
});

export default router;
