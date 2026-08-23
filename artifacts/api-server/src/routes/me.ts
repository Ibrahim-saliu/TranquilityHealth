import { Router, type IRouter } from "express";
import { z } from "zod";
import { eq, and, asc, desc, sql } from "drizzle-orm";
import {
  db,
  patientsTable,
  consentRecordsTable,
  appointmentsTable,
  providersTable,
} from "@workspace/db";
import { requireAuth, getCurrentUser } from "../lib/session";
import { writeAuditLog } from "../lib/audit";
import { CONSENT_TYPES, CONSENT_DOCUMENT_VERSION, consentTypesToInsert } from "../lib/consent";

const router: IRouter = Router();

// ---------------------------------------------------------------------------
// All /me/* routes are the patient's own resources — patient role only.
// ---------------------------------------------------------------------------
router.use("/me", requireAuth("patient"));

// ---------------------------------------------------------------------------
// Resolve the patients row for the signed-in user. Every patient account has
// exactly one patients row (created at invite-accept), so a miss means the
// account is malformed rather than simply "no data".
// ---------------------------------------------------------------------------
async function loadPatient(userId: string) {
  const [patient] = await db
    .select()
    .from(patientsTable)
    .where(eq(patientsTable.userId, userId))
    .limit(1);
  return patient ?? null;
}

// ---------------------------------------------------------------------------
// GET /me/onboarding
// Current onboarding state — demographics on file plus which consents are
// already signed. The client uses this to prefill the form and to decide
// whether to send the patient to onboarding or straight to the dashboard.
// ---------------------------------------------------------------------------
router.get("/me/onboarding", async (req, res) => {
  const { userId } = getCurrentUser(req)!;
  try {
    const patient = await loadPatient(userId);
    if (!patient) {
      res.status(404).json({ error: "Patient profile not found" });
      return;
    }

    const consents = await db
      .select({ consentType: consentRecordsTable.consentType, signedAt: consentRecordsTable.signedAt })
      .from(consentRecordsTable)
      .where(eq(consentRecordsTable.patientId, patient.id));

    res.json({
      onboarding: {
        onboardingStatus: patient.onboardingStatus,
        fullName: patient.fullName,
        dateOfBirth: patient.dateOfBirth,
        phone: patient.phone,
        address: patient.address,
        consents: consents.map((c) => c.consentType),
      },
    });
  } catch (_err) {
    res.status(500).json({ error: "Failed to load onboarding state" });
  }
});

// ---------------------------------------------------------------------------
// POST /me/onboarding
// Complete onboarding in a single submit: save demographics, record the
// signed consents (with IP + method for the legal trail), and flip
// onboardingStatus to "complete". Both consents are required.
// ---------------------------------------------------------------------------
const onboardingSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be YYYY-MM-DD"),
  phone: z.string().trim().min(7, "A valid phone number is required").max(40),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  consents: z.object({
    hipaa: z.literal(true, { errorMap: () => ({ message: "You must accept the HIPAA notice" }) }),
    telehealth: z.literal(true, {
      errorMap: () => ({ message: "You must accept the telehealth consent" }),
    }),
  }),
});

router.post("/me/onboarding", async (req, res) => {
  const { userId } = getCurrentUser(req)!;

  const parsed = onboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      issues: parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
    return;
  }

  const { fullName, dateOfBirth, phone, address } = parsed.data;

  try {
    const patient = await loadPatient(userId);
    if (!patient) {
      res.status(404).json({ error: "Patient profile not found" });
      return;
    }

    // Demographics and consent records must land together or not at all — a
    // patient marked "complete" without their consent records on file would be
    // a compliance gap. Run both writes in one transaction.
    const { updated, consentsRecorded } = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(patientsTable)
        .set({
          fullName,
          dateOfBirth,
          phone,
          address: address ? address : null,
          onboardingStatus: "complete",
          updatedAt: new Date(),
        })
        .where(eq(patientsTable.id, patient.id))
        .returning();

      // Record any consent not already on file *for the current document
      // version*. Consent records are immutable and version-scoped, so if the
      // document text changes (version bumps) the new version is captured as a
      // fresh signature rather than silently skipped. A re-submit of the same
      // version inserts nothing.
      const existing = await tx
        .select({ consentType: consentRecordsTable.consentType })
        .from(consentRecordsTable)
        .where(
          and(
            eq(consentRecordsTable.patientId, patient.id),
            eq(consentRecordsTable.documentVersion, CONSENT_DOCUMENT_VERSION),
          ),
        );

      const toInsert = consentTypesToInsert(existing.map((c) => c.consentType)).map((type) => ({
        patientId: patient.id,
        consentType: type,
        documentVersion: CONSENT_DOCUMENT_VERSION,
        signatureMethod: "electronic_checkbox",
        ipAddress: req.ip ?? null,
      }));

      if (toInsert.length > 0) {
        // onConflictDoNothing guards the unique (patient, type, version)
        // constraint against a concurrent submit racing between the select
        // above and this insert.
        await tx.insert(consentRecordsTable).values(toInsert).onConflictDoNothing();
      }

      return { updated: row, consentsRecorded: toInsert.length };
    });

    // Best-effort audit after the transaction has committed.
    await writeAuditLog({
      action: "ONBOARDING_COMPLETED",
      entityType: "patient",
      entityId: patient.id,
      actorId: userId,
      metadata: { consentsRecorded },
    });

    res.json({
      onboarding: {
        onboardingStatus: updated.onboardingStatus,
        fullName: updated.fullName,
        dateOfBirth: updated.dateOfBirth,
        phone: updated.phone,
        address: updated.address,
        consents: Object.values(CONSENT_TYPES),
      },
    });
  } catch (_err) {
    res.status(500).json({ error: "Failed to save onboarding" });
  }
});

// ---------------------------------------------------------------------------
// GET /me/appointments
// The patient's own appointments joined with provider info.
// Query: view = "upcoming" | "past" | "all" (default "upcoming").
// ---------------------------------------------------------------------------
router.get("/me/appointments", async (req, res) => {
  const { userId } = getCurrentUser(req)!;
  const view = (req.query.view ?? "upcoming") as string;
  if (!["upcoming", "past", "all"].includes(view)) {
    res.status(400).json({ error: "Invalid view — must be upcoming, past, or all" });
    return;
  }

  try {
    const patient = await loadPatient(userId);
    if (!patient) {
      res.status(404).json({ error: "Patient profile not found" });
      return;
    }

    const now = new Date();
    // "Upcoming" means not yet ended — an in-progress visit stays here until its
    // end time so the join window (and Join button) remains reachable. "Past"
    // means fully ended.
    const notEnded = sql`${appointmentsTable.scheduledAt} + (${appointmentsTable.durationMinutes} * interval '1 minute') > ${now}`;
    const ended = sql`${appointmentsTable.scheduledAt} + (${appointmentsTable.durationMinutes} * interval '1 minute') <= ${now}`;
    const scope =
      view === "upcoming"
        ? and(eq(appointmentsTable.patientId, patient.id), notEnded)
        : view === "past"
          ? and(eq(appointmentsTable.patientId, patient.id), ended)
          : eq(appointmentsTable.patientId, patient.id);

    const orderBy =
      view === "past" ? desc(appointmentsTable.scheduledAt) : asc(appointmentsTable.scheduledAt);

    const rows = await db
      .select({
        id: appointmentsTable.id,
        scheduledAt: appointmentsTable.scheduledAt,
        durationMinutes: appointmentsTable.durationMinutes,
        appointmentType: appointmentsTable.appointmentType,
        status: appointmentsTable.status,
        providerName: providersTable.fullName,
        providerCredentials: providersTable.credentials,
      })
      .from(appointmentsTable)
      .leftJoin(providersTable, eq(appointmentsTable.providerId, providersTable.id))
      .where(scope)
      .orderBy(orderBy);

    res.json({ appointments: rows });
  } catch (_err) {
    res.status(500).json({ error: "Failed to load appointments" });
  }
});

export default router;
