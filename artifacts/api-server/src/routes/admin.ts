// TODO (Phase 3): Add RBAC middleware — require admin role on all routes below
import { Router, type IRouter } from "express";
import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";
import { db, appointmentRequestsTable, providersTable } from "@workspace/db";
import { writeAuditLog } from "../lib/audit";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// Allowed status values for Phase 2
// ---------------------------------------------------------------------------
const ALLOWED_STATUSES = ["new", "under_review", "approved", "rejected", "invited"] as const;
type RequestStatus = (typeof ALLOWED_STATUSES)[number];

const statusSchema = z.enum(ALLOWED_STATUSES);

// ---------------------------------------------------------------------------
// GET /admin/requests
// List all appointment requests, optionally filtered by ?status=
// ---------------------------------------------------------------------------
router.get("/admin/requests", async (req, res) => {
  const statusFilter = req.query.status as string | undefined;

  if (statusFilter && !ALLOWED_STATUSES.includes(statusFilter as RequestStatus)) {
    res.status(400).json({ error: "Invalid status filter value" });
    return;
  }

  try {
    const rows = statusFilter
      ? await db
          .select()
          .from(appointmentRequestsTable)
          .where(eq(appointmentRequestsTable.status, statusFilter))
          .orderBy(desc(appointmentRequestsTable.createdAt))
      : await db
          .select()
          .from(appointmentRequestsTable)
          .orderBy(desc(appointmentRequestsTable.createdAt));

    res.json({ requests: rows });
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
// Update the status of an appointment request
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
      .select({ id: appointmentRequestsTable.id, status: appointmentRequestsTable.status })
      .from(appointmentRequestsTable)
      .where(eq(appointmentRequestsTable.id, id));

    if (!existing) {
      res.status(404).json({ error: "Request not found" });
      return;
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
// GET /admin/providers/active
// Return the single active provider, or null if none exists yet
// ---------------------------------------------------------------------------
router.get("/admin/providers/active", async (_req, res) => {
  try {
    const [provider] = await db
      .select()
      .from(providersTable)
      .where(eq(providersTable.isActive, true))
      .orderBy(desc(providersTable.createdAt))
      .limit(1);

    res.json({ provider: provider ?? null });
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
      .where(eq(providersTable.isActive, true))
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

export default router;
