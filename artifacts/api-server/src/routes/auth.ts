import { Router, type IRouter } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable, patientsTable } from "@workspace/db";
import { getCurrentUser } from "../lib/session";
import { writeAuditLog } from "../lib/audit";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// POST /api/auth/login
// Validates email+password, creates a session on success.
// ---------------------------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { email, password } = parsed.data;

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()));

    if (!user) {
      await writeAuditLog({
        action: "LOGIN_FAILURE",
        entityType: "user",
        entityId: "unknown",
        metadata: { email, reason: "user_not_found" },
      });
      // Return same error as wrong password — don't reveal if email exists
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      await writeAuditLog({
        action: "LOGIN_FAILURE",
        entityType: "user",
        entityId: user.id,
        metadata: { reason: "wrong_password" },
      });
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Set session
    req.session.userId = user.id;
    req.session.role = user.role;

    await writeAuditLog({
      action: "LOGIN_SUCCESS",
      entityType: "user",
      entityId: user.id,
      actorId: user.id,
    });

    res.json({
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (_err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/logout
// Destroys the session.
// ---------------------------------------------------------------------------
router.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Logout failed" });
      return;
    }
    res.clearCookie("th.sid");
    res.json({ ok: true });
  });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// Returns the current session user (+ patient name if role=patient), or 401.
// ---------------------------------------------------------------------------
router.get("/auth/me", async (req, res) => {
  const sessionUser = getCurrentUser(req);
  if (!sessionUser) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const [user] = await db
      .select({ id: usersTable.id, email: usersTable.email, role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, sessionUser.userId));

    if (!user) {
      req.session.destroy(() => {});
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    // For patient accounts, also return their display name from the patients table
    let name: string | null = null;
    if (user.role === "patient") {
      const [patient] = await db
        .select({ fullName: patientsTable.fullName })
        .from(patientsTable)
        .where(eq(patientsTable.userId, user.id));
      name = patient?.fullName ?? null;
    }

    res.json({ user: { ...user, name } });
  } catch (_err) {
    res.status(500).json({ error: "Failed to load user" });
  }
});

export default router;
