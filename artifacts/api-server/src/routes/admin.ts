import { Router, type IRouter } from "express";
import { z } from "zod";
import { eq, desc, sql, count, or } from "drizzle-orm";
import { db, appointmentRequestsTable, providersTable, usersTable, inviteTokensTable } from "@workspace/db";
import { writeAuditLog } from "../lib/audit";
import { requireAuth } from "../lib/session";
import { generateInvite } from "../lib/invite";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// All /admin/* routes require an authenticated session (admin or collaborator).
// Specific admin-only actions add an inline requireAuth("admin") guard.
// ---------------------------------------------------------------------------
router.use("/admin", requireAuth(["admin", "collaborator"]));

// ---------------------------------------------------------------------------
// Allowed status values for Phase 2
// ---------------------------------------------------------------------------
const ALLOWED_STATUSES = ["new", "under_review", "approved", "rejected", "invited"] as const;
type RequestStatus = (typeof ALLOWED_STATUSES)[number];

const statusSchema = z.enum(ALLOWED_STATUSES);

// ---------------------------------------------------------------------------
// GET /admin/requests
// List appointment requests with optional ?status= filter and pagination
// Query params: status?, page (default 1), pageSize (default 20, max 100)
// ---------------------------------------------------------------------------
router.get("/admin/requests", async (req, res) => {
  const statusFilter = req.query.status as string | undefined;

  if (statusFilter && !ALLOWED_STATUSES.includes(statusFilter as RequestStatus)) {
    res.status(400).json({ error: "Invalid status filter value" });
    return;
  }

  const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
  const pageSizeRaw = parseInt(String(req.query.pageSize ?? "20"), 10);
  const page = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
  const pageSize = isNaN(pageSizeRaw) || pageSizeRaw < 1 ? 20 : Math.min(pageSizeRaw, 100);
  const offset = (page - 1) * pageSize;

  try {
    const baseQuery = statusFilter
      ? db.select().from(appointmentRequestsTable).where(eq(appointmentRequestsTable.status, statusFilter))
      : db.select().from(appointmentRequestsTable);

    const countQuery = statusFilter
      ? db.select({ total: count() }).from(appointmentRequestsTable).where(eq(appointmentRequestsTable.status, statusFilter))
      : db.select({ total: count() }).from(appointmentRequestsTable);

    const [rows, countRows] = await Promise.all([
      baseQuery.orderBy(desc(appointmentRequestsTable.createdAt)).limit(pageSize).offset(offset),
      countQuery,
    ]);

    const total = countRows[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    res.json({ requests: rows, total, page, pageSize, totalPages });
  } catch (_err) {
    res.status(500).json({ error: "Failed to load requests" });
  }
});

// ---------------------------------------------------------------------------
// GET /admin/requests/counts
// Returns counts per status for the dashboard
// ---------------------------------------------------------------------------
router.get("/admin/requests/counts", async (_req, res) => {
  try {
    const rows = await db
      .select({
        status: appointmentRequestsTable.status,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(appointmentRequestsTable)
      .groupBy(appointmentRequestsTable.status);

    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.status] = row.count;
    }
    res.json({ counts });
  } catch (_err) {
    res.status(500).json({ error: "Failed to load counts" });
  }
});

// ---------------------------------------------------------------------------
// GET /admin/requests/:id
// Fetch a single appointment request by id
// ---------------------------------------------------------------------------
router.get("/admin/requests/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [row] = await db
      .select()
      .from(appointmentRequestsTable)
      .where(eq(appointmentRequestsTable.id, id));

    if (!row) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    res.json({ request: row });
  } catch (_err) {
    res.status(500).json({ error: "Failed to load request" });
  }
});

// ---------------------------------------------------------------------------
// PATCH /admin/requests/:id/status
// Update the status of an appointment request.
// When status === "invited", auto-generate an invite token and log the link.
// ---------------------------------------------------------------------------
const updateStatusSchema = z.object({
  status: statusSchema,
});

router.patch("/admin/requests/:id/status", async (req, res) => {
  const { id } = req.params;

  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid status value",
      allowed: ALLOWED_STATUSES,
    });
    return;
  }

  const { status } = parsed.data;

  try {
    const [existing] = await db
      .select({
        id: appointmentRequestsTable.id,
        status: appointmentRequestsTable.status,
        email: appointmentRequestsTable.email,
      })
      .from(appointmentRequestsTable)
      .where(eq(appointmentRequestsTable.id, id));

    if (!existing) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    // When transitioning to "invited", generate the invite token FIRST.
    // If invite creation fails, we abort before updating status — preventing
    // a request stuck in "invited" without a usable token/link.
    if (status === "invited") {
      await generateInvite(existing.email, "patient", id);
    }

    const [updated] = await db
      .update(appointmentRequestsTable)
      .set({
        status,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(appointmentRequestsTable.id, id))
      .returning({ id: appointmentRequestsTable.id, status: appointmentRequestsTable.status });

    await writeAuditLog({
      action: "REQUEST_STATUS_UPDATED",
      entityType: "appointment_request",
      entityId: id,
      metadata: { previousStatus: existing.status, newStatus: status },
    });

    res.json({ request: updated });
  } catch (_err) {
    res.status(500).json({ error: "Failed to update request status" });
  }
});

// ---------------------------------------------------------------------------
// Placeholder provider seeded on first GET if the table is truly empty
// ---------------------------------------------------------------------------
const PLACEHOLDER_PROVIDER = {
  fullName: "Provider Name",
  credentials: "MD",
  licenseState: "TX",
  bio: "Board-certified provider serving the Tranquility Health clinic.",
  profileImageUrl: "",
  isActive: true,
} as const;

// ---------------------------------------------------------------------------
// GET /admin/providers/active
// Return the canonical provider row (latest by created_at, regardless of
// isActive). Seeds a safe placeholder only when the table is empty.
// ---------------------------------------------------------------------------
router.get("/admin/providers/active", async (_req, res) => {
  try {
    let [provider] = await db
      .select()
      .from(providersTable)
      .orderBy(desc(providersTable.createdAt))
      .limit(1);

    if (!provider) {
      [provider] = await db
        .insert(providersTable)
        .values(PLACEHOLDER_PROVIDER)
        .returning();

      await writeAuditLog({
        action: "PROVIDER_PLACEHOLDER_SEEDED",
        entityType: "provider",
        entityId: provider.id,
        metadata: { reason: "first_run" },
      });
    }

    res.json({ provider });
  } catch (_err) {
    res.status(500).json({ error: "Failed to load provider" });
  }
});

// ---------------------------------------------------------------------------
// PUT /admin/providers/active
// Upsert the active provider profile
// ---------------------------------------------------------------------------
const providerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  credentials: z.string().default(""),
  licenseState: z.string().min(2).max(2).default("TX"),
  bio: z.string().default(""),
  profileImageUrl: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

router.put("/admin/providers/active", async (req, res) => {
  const parsed = providerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      issues: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
    return;
  }

  const data = parsed.data;

  try {
    const [existing] = await db
      .select({ id: providersTable.id })
      .from(providersTable)
      .orderBy(desc(providersTable.createdAt))
      .limit(1);

    let provider;
    if (existing) {
      [provider] = await db
        .update(providersTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(providersTable.id, existing.id))
        .returning();
    } else {
      [provider] = await db.insert(providersTable).values(data).returning();
    }

    await writeAuditLog({
      action: "PROVIDER_PROFILE_UPDATED",
      entityType: "provider",
      entityId: provider.id,
      metadata: { fullName: data.fullName, credentials: data.credentials },
    });

    res.json({ provider });
  } catch (_err) {
    res.status(500).json({ error: "Failed to save provider" });
  }
});

// ---------------------------------------------------------------------------
// GET /admin/team
// List all admin and collaborator users, plus pending collaborator invites
// ---------------------------------------------------------------------------
router.get("/admin/team", async (req, res) => {
  try {
    const admins = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(or(eq(usersTable.role, "admin"), eq(usersTable.role, "collaborator")))
      .orderBy(usersTable.createdAt);

    const pendingInvites = await db
      .select({
        id: inviteTokensTable.id,
        email: inviteTokensTable.email,
        createdAt: inviteTokensTable.createdAt,
        expiresAt: inviteTokensTable.expiresAt,
        used: inviteTokensTable.used,
      })
      .from(inviteTokensTable)
      .where(eq(inviteTokensTable.role, "collaborator"))
      .orderBy(desc(inviteTokensTable.createdAt));

    res.json({ admins, pendingInvites });
  } catch (_err) {
    res.status(500).json({ error: "Failed to load team" });
  }
});

// ---------------------------------------------------------------------------
// POST /admin/invite-staff  [admin only]
// Invite a new collaborator. Returns the raw token so the caller can share the link.
// ---------------------------------------------------------------------------
const inviteStaffSchema = z.object({
  email: z.string().email("Valid email required"),
});

router.post("/admin/invite-staff", requireAuth("admin"), async (req, res) => {
  const parsed = inviteStaffSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const { email } = parsed.data;

  try {
    const [existingUser] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()));

    if (existingUser) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const rawToken = await generateInvite(email.toLowerCase(), "collaborator");

    const baseUrl = process.env["APP_BASE_URL"] ?? "";
    const inviteUrl = baseUrl
      ? `${baseUrl}/admin/accept-invite/${rawToken}`
      : `/admin/accept-invite/${rawToken}`;

    res.status(201).json({ inviteUrl });
  } catch (_err) {
    res.status(500).json({ error: "Failed to create invite" });
  }
});

// ---------------------------------------------------------------------------
// POST /admin/invite-staff/resend  [admin only]
// Generates a fresh collaborator invite link for a pending invite email.
// ---------------------------------------------------------------------------
const resendInviteSchema = z.object({
  email: z.string().email("Valid email required"),
});

router.post("/admin/invite-staff/resend", requireAuth("admin"), async (req, res) => {
  const parsed = resendInviteSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid request" });
    return;
  }

  const { email } = parsed.data;

  try {
    const [existingUser] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase()));

    if (existingUser) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const rawToken = await generateInvite(email.toLowerCase(), "collaborator");
    const inviteUrl = `/admin/accept-invite/${rawToken}`;

    res.status(201).json({ inviteUrl });
  } catch (_err) {
    res.status(500).json({ error: "Failed to regenerate invite link" });
  }
});

// ---------------------------------------------------------------------------
// DELETE /admin/team/:userId  [admin only]
// Remove a collaborator from the team. Cannot delete yourself or another admin.
// ---------------------------------------------------------------------------
router.delete("/admin/team/:userId", requireAuth("admin"), async (req, res) => {
  const userId = String(req.params["userId"]);
  const currentUserId = req.session.userId!;

  if (userId === currentUserId) {
    res.status(400).json({ error: "You cannot remove your own account" });
    return;
  }

  try {
    const [target] = await db
      .select({ id: usersTable.id, role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (target.role === "admin") {
      res.status(400).json({ error: "Cannot remove an admin account" });
      return;
    }

    await db.delete(usersTable).where(eq(usersTable.id, userId));
    res.status(204).send();
  } catch (_err) {
    res.status(500).json({ error: "Failed to remove collaborator" });
  }
});

export default router;
