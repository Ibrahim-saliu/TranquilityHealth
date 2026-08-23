import { Router, type IRouter } from "express";
import { z } from "zod";
import { eq, desc, asc, gte, lt, sql, count, or, and } from "drizzle-orm";
import { db, appointmentRequestsTable, appointmentsTable, patientsTable, providersTable, usersTable, inviteTokensTable } from "@workspace/db";
import { writeAuditLog } from "../lib/audit";
import { requireAuth, getCurrentUser } from "../lib/session";
import { generateInvite } from "../lib/invite";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// All /admin/* routes require at minimum an authenticated staff session.
// Appointment-request and team-management routes add a stricter per-route
// guard below (admin|collaborator only). Provider-role users can only
// reach the providers/active profile endpoints.
// ---------------------------------------------------------------------------
router.use("/admin", requireAuth(["admin", "collaborator", "provider"]));

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
// Restricted to admin and collaborator — providers cannot access request data.
// ---------------------------------------------------------------------------
router.get("/admin/requests", requireAuth(["admin", "collaborator"]), async (req, res) => {
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
// Restricted to admin and collaborator — providers cannot access request data.
// ---------------------------------------------------------------------------
router.get("/admin/requests/counts", requireAuth(["admin", "collaborator"]), async (_req, res) => {
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
// Restricted to admin and collaborator — providers cannot access request data.
// ---------------------------------------------------------------------------
router.get("/admin/requests/:id", requireAuth(["admin", "collaborator"]), async (req, res) => {
  const id = String(req.params.id);
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
// Restricted to admin and collaborator — providers cannot mutate request data.
// ---------------------------------------------------------------------------
const updateStatusSchema = z.object({
  status: statusSchema,
});

router.patch("/admin/requests/:id/status", requireAuth(["admin", "collaborator"]), async (req, res) => {
  const id = String(req.params.id);

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
// Provider input validation schemas
// ---------------------------------------------------------------------------

// Full schema — used for admin create/update (includes isActive).
const providerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  credentials: z.string().default(""),
  licenseState: z.string().min(2).max(2).default("TX"),
  bio: z.string().default(""),
  profileImageUrl: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

// Restricted schema — used for provider self-update.
// Excludes isActive and other admin-owned fields so providers cannot
// change their own roster status or escalate privileges.
const providerSelfSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  credentials: z.string().default(""),
  licenseState: z.string().min(2).max(2).default("TX"),
  bio: z.string().default(""),
  profileImageUrl: z.string().optional().or(z.literal("")),
});

// ---------------------------------------------------------------------------
// GET /admin/providers
// List all provider records ordered by name.
// Accessible to admin and collaborator.
// ---------------------------------------------------------------------------
router.get("/admin/providers", requireAuth(["admin", "collaborator"]), async (_req, res) => {
  try {
    const providers = await db
      .select()
      .from(providersTable)
      .orderBy(asc(providersTable.fullName));
    res.json({ providers });
  } catch (_err) {
    res.status(500).json({ error: "Failed to load providers" });
  }
});

// ---------------------------------------------------------------------------
// POST /admin/providers
// Create a new provider profile. Admin only.
// ---------------------------------------------------------------------------
router.post("/admin/providers", requireAuth("admin"), async (req, res) => {
  const parsed = providerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      issues: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
    return;
  }

  try {
    const [provider] = await db
      .insert(providersTable)
      .values(parsed.data)
      .returning();

    await writeAuditLog({
      action: "PROVIDER_CREATED",
      entityType: "provider",
      entityId: provider.id,
      metadata: { fullName: parsed.data.fullName },
    });

    res.status(201).json({ provider });
  } catch (_err) {
    res.status(500).json({ error: "Failed to create provider" });
  }
});

// ---------------------------------------------------------------------------
// GET /admin/providers/active  — MUST be registered before /:id
// Legacy endpoint — returns the first active provider for backward
// compatibility (e.g. ProviderDashboard fallback, About page).
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
// PUT /admin/providers/active  — MUST be registered before /:id
// Legacy upsert endpoint — kept for existing callers (admin-api upsertProvider).
// ---------------------------------------------------------------------------
router.put("/admin/providers/active", requireAuth("admin"), async (req, res) => {
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
      metadata: { fullName: data.fullName },
    });

    res.json({ provider });
  } catch (_err) {
    res.status(500).json({ error: "Failed to save provider" });
  }
});

// ---------------------------------------------------------------------------
// PUT /admin/providers/:id  — registered AFTER /active to avoid shadowing
// Update a provider profile by ID. Admin only.
// ---------------------------------------------------------------------------
router.put("/admin/providers/:id", requireAuth("admin"), async (req, res) => {
  const id = String(req.params.id);
  const parsed = providerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      issues: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
    return;
  }

  try {
    const [provider] = await db
      .update(providersTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(providersTable.id, id))
      .returning();

    if (!provider) {
      res.status(404).json({ error: "Provider not found" });
      return;
    }

    await writeAuditLog({
      action: "PROVIDER_UPDATED",
      entityType: "provider",
      entityId: provider.id,
      metadata: { fullName: parsed.data.fullName },
    });

    res.json({ provider });
  } catch (_err) {
    res.status(500).json({ error: "Failed to update provider" });
  }
});

// ---------------------------------------------------------------------------
// GET /providers/me
// Returns the provider record linked to the currently signed-in provider user.
// Accessible to provider role only.
// ---------------------------------------------------------------------------
router.get("/providers/me", requireAuth("provider"), async (req, res) => {
  const userId = req.session.userId;
  try {
    const [provider] = await db
      .select()
      .from(providersTable)
      .where(eq(providersTable.userId, userId!))
      .limit(1);

    res.json({ provider: provider ?? null });
  } catch (_err) {
    res.status(500).json({ error: "Failed to load provider profile" });
  }
});

// ---------------------------------------------------------------------------
// PUT /providers/me
// Allows a signed-in provider to update their own profile.
// Uses the restricted self-edit schema — isActive is excluded so providers
// cannot change their own roster status.
// Provider role only.
// ---------------------------------------------------------------------------
router.put("/providers/me", requireAuth("provider"), async (req, res) => {
  const userId = req.session.userId;
  const parsed = providerSelfSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      issues: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
    return;
  }

  try {
    const [existing] = await db
      .select({ id: providersTable.id })
      .from(providersTable)
      .where(eq(providersTable.userId, userId!))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "No provider profile linked to your account" });
      return;
    }

    const [provider] = await db
      .update(providersTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(providersTable.id, existing.id))
      .returning();

    await writeAuditLog({
      action: "PROVIDER_SELF_UPDATED",
      entityType: "provider",
      entityId: provider.id,
      actorId: userId,
      metadata: { fullName: parsed.data.fullName },
    });

    res.json({ provider });
  } catch (_err) {
    res.status(500).json({ error: "Failed to update provider profile" });
  }
});

// ---------------------------------------------------------------------------
// GET /admin/team
// List all admin, collaborator, and provider users, plus pending staff invites.
// Providers are blocked client-side; this guard ensures only admin/collaborator
// can fetch team data.
// ---------------------------------------------------------------------------
router.get("/admin/team", requireAuth(["admin", "collaborator"]), async (req, res) => {
  try {
    const members = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(
        or(
          eq(usersTable.role, "admin"),
          eq(usersTable.role, "collaborator"),
          eq(usersTable.role, "provider"),
        ),
      )
      .orderBy(usersTable.createdAt);

    const pendingInvites = await db
      .select({
        id: inviteTokensTable.id,
        email: inviteTokensTable.email,
        role: inviteTokensTable.role,
        createdAt: inviteTokensTable.createdAt,
        expiresAt: inviteTokensTable.expiresAt,
        used: inviteTokensTable.used,
      })
      .from(inviteTokensTable)
      .where(or(eq(inviteTokensTable.role, "collaborator"), eq(inviteTokensTable.role, "provider")))
      .orderBy(desc(inviteTokensTable.createdAt));

    res.json({ members, pendingInvites });
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
// POST /admin/invite-provider  [admin only]
// Invite a new provider-role user. Returns the raw token so the caller can share the link.
// ---------------------------------------------------------------------------
const inviteProviderSchema = z.object({
  email: z.string().email("Valid email required"),
});

router.post("/admin/invite-provider", requireAuth("admin"), async (req, res) => {
  const parsed = inviteProviderSchema.safeParse(req.body);
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

    const rawToken = await generateInvite(email.toLowerCase(), "provider");

    const baseUrl = process.env["APP_BASE_URL"] ?? "";
    const inviteUrl = baseUrl
      ? `${baseUrl}/admin/accept-invite/${rawToken}`
      : `/admin/accept-invite/${rawToken}`;

    res.status(201).json({ inviteUrl });
  } catch (_err) {
    res.status(500).json({ error: "Failed to create provider invite" });
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

// ---------------------------------------------------------------------------
// GET /api/admin/appointments
// List scheduled appointments joined with patient and provider info.
// Query params:
//   view: "upcoming" | "past" | "all" (default "all")
//   page: number (default 1)
//   pageSize: number (default 50, max 200)
// Restricted to admin and collaborator.
// ---------------------------------------------------------------------------
router.get("/admin/appointments", requireAuth(["admin", "collaborator"]), async (req, res) => {
  const view = (req.query.view ?? "all") as string;
  if (!["upcoming", "past", "all"].includes(view)) {
    res.status(400).json({ error: "Invalid view — must be upcoming, past, or all" });
    return;
  }

  const pageRaw = parseInt(String(req.query.page ?? "1"), 10);
  const pageSizeRaw = parseInt(String(req.query.pageSize ?? "50"), 10);
  const page = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
  const pageSize = isNaN(pageSizeRaw) || pageSizeRaw < 1 ? 50 : Math.min(pageSizeRaw, 200);
  const offset = (page - 1) * pageSize;
  const now = new Date();

  const viewFilter =
    view === "upcoming"
      ? gte(appointmentsTable.scheduledAt, now)
      : view === "past"
        ? lt(appointmentsTable.scheduledAt, now)
        : undefined;

  const orderBy =
    view === "past"
      ? desc(appointmentsTable.scheduledAt)
      : asc(appointmentsTable.scheduledAt);

  try {
    const baseQ = db
      .select({
        id: appointmentsTable.id,
        scheduledAt: appointmentsTable.scheduledAt,
        durationMinutes: appointmentsTable.durationMinutes,
        appointmentType: appointmentsTable.appointmentType,
        status: appointmentsTable.status,
        notes: appointmentsTable.notes,
        createdAt: appointmentsTable.createdAt,
        patientId: appointmentsTable.patientId,
        patientName: patientsTable.fullName,
        patientEmail: usersTable.email,
        providerId: appointmentsTable.providerId,
        providerName: providersTable.fullName,
        providerCredentials: providersTable.credentials,
      })
      .from(appointmentsTable)
      .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
      .leftJoin(usersTable, eq(patientsTable.userId, usersTable.id))
      .leftJoin(providersTable, eq(appointmentsTable.providerId, providersTable.id));

    const countQ = db
      .select({ total: count() })
      .from(appointmentsTable);

    const [rows, countRows] = await Promise.all([
      (viewFilter ? baseQ.where(viewFilter) : baseQ)
        .orderBy(orderBy)
        .limit(pageSize)
        .offset(offset),
      viewFilter ? countQ.where(viewFilter) : countQ,
    ]);

    const total = countRows[0]?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    res.json({ appointments: rows, total, page, pageSize, totalPages });
  } catch (_err) {
    res.status(500).json({ error: "Failed to load appointments" });
  }
});

// ---------------------------------------------------------------------------
// GET /admin/patients
// Lightweight list of patient accounts, for pickers (e.g. scheduling).
// Restricted to admin and collaborator.
// ---------------------------------------------------------------------------
router.get("/admin/patients", requireAuth(["admin", "collaborator"]), async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: patientsTable.id,
        fullName: patientsTable.fullName,
        email: usersTable.email,
        onboardingStatus: patientsTable.onboardingStatus,
      })
      .from(patientsTable)
      .leftJoin(usersTable, eq(patientsTable.userId, usersTable.id))
      .orderBy(asc(patientsTable.fullName));

    res.json({ patients: rows });
  } catch (_err) {
    res.status(500).json({ error: "Failed to load patients" });
  }
});

// ---------------------------------------------------------------------------
// POST /admin/appointments
// Schedule an appointment for a patient with a provider. This is the write
// path the patient-facing appointments view depends on.
// Restricted to admin and collaborator.
// ---------------------------------------------------------------------------
const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  providerId: z.string().min(1, "Provider is required"),
  scheduledAt: z.string().datetime({ message: "A valid date/time is required" }),
  appointmentType: z.enum(["medication_management", "psychotherapy", "initial_evaluation"]),
  durationMinutes: z.number().int().positive().max(240).optional(),
  notes: z.string().max(2000).optional(),
});

router.post("/admin/appointments", requireAuth(["admin", "collaborator"]), async (req, res) => {
  const parsed = createAppointmentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      issues: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
    return;
  }

  const { patientId, providerId, scheduledAt, appointmentType, durationMinutes, notes } = parsed.data;

  const duration = durationMinutes ?? 50;
  const startAt = new Date(scheduledAt);
  const endAt = new Date(startAt.getTime() + duration * 60_000);

  // Reject appointments scheduled in the past — a clinic only books forward.
  if (startAt.getTime() <= Date.now()) {
    res.status(400).json({ error: "Appointment time must be in the future." });
    return;
  }

  try {
    // Confirm both sides exist so we can return clear errors instead of an FK failure.
    const [patient] = await db
      .select({ id: patientsTable.id })
      .from(patientsTable)
      .where(eq(patientsTable.id, patientId));
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    const [provider] = await db
      .select({ id: providersTable.id, isActive: providersTable.isActive })
      .from(providersTable)
      .where(eq(providersTable.id, providerId));
    if (!provider) {
      res.status(404).json({ error: "Provider not found" });
      return;
    }
    // A deactivated provider is off the roster and cannot take bookings, even
    // if a stale client somehow submits their id.
    if (!provider.isActive) {
      res.status(409).json({ error: "This provider is inactive and cannot be scheduled." });
      return;
    }

    // Double-booking guard: reject if this provider already has a non-cancelled
    // appointment whose time window overlaps the requested one. Two intervals
    // [s1,e1) and [s2,e2) overlap iff s1 < e2 AND s2 < e1.
    const [conflict] = await db
      .select({ id: appointmentsTable.id })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.providerId, providerId),
          sql`${appointmentsTable.status} <> 'cancelled'`,
          lt(appointmentsTable.scheduledAt, endAt),
          sql`${appointmentsTable.scheduledAt} + (${appointmentsTable.durationMinutes} * interval '1 minute') > ${startAt}`,
        ),
      )
      .limit(1);
    if (conflict) {
      res.status(409).json({ error: "This provider already has an appointment during that time." });
      return;
    }

    const [appointment] = await db
      .insert(appointmentsTable)
      .values({
        patientId,
        providerId,
        scheduledAt: startAt,
        appointmentType,
        durationMinutes: duration,
        notes: notes ?? null,
        status: "scheduled",
      })
      .returning();

    await writeAuditLog({
      action: "APPOINTMENT_SCHEDULED",
      entityType: "appointment",
      entityId: appointment.id,
      actorId: getCurrentUser(req)?.userId,
      metadata: { patientId, providerId, appointmentType },
    });

    res.status(201).json({ appointment });
  } catch (_err) {
    res.status(500).json({ error: "Failed to schedule appointment" });
  }
});

export default router;
