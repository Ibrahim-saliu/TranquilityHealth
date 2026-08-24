import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  adminNotificationRecipientsTable,
  db,
  appointmentRequestsTable,
  notificationDeliveriesTable,
} from "@workspace/db";
import {
  buildNotificationDeliveryRows,
  processPendingNotificationDeliveries,
} from "../lib/notifications";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const publicRequestSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("A valid email address is required"),
  phone: z.string().min(7, "A valid phone number is required"),
  preferredTime: z.string().min(1, "Preferred time is required"),
  serviceInterest: z.enum(["therapy", "medication", "not_sure"]),
  preferredContactMethod: z.enum(["phone", "email"]).optional(),
  isNewPatient: z.boolean().optional(),
  contactConsent: z.literal(true, { message: "You must consent to be contacted" }),
});

router.post("/appointment-requests", async (req, res) => {
  const parsed = publicRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Validation failed",
      issues: parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  try {
    const row = await db.transaction(async (tx) => {
      const [request] = await tx
        .insert(appointmentRequestsTable)
        .values({
          ...parsed.data,
          status: "new",
        })
        .returning({ id: appointmentRequestsTable.id, status: appointmentRequestsTable.status });

      const recipients = await tx
        .select({
          id: adminNotificationRecipientsTable.id,
          email: adminNotificationRecipientsTable.email,
          phone: adminNotificationRecipientsTable.phone,
        })
        .from(adminNotificationRecipientsTable)
        .where(eq(adminNotificationRecipientsTable.isActive, true));
      const deliveries = buildNotificationDeliveryRows(request.id, recipients);
      if (deliveries.length > 0) {
        await tx.insert(notificationDeliveriesTable).values(deliveries);
      }
      return request;
    });

    // Never wait for a provider call in the public intake request. The
    // transaction above has already persisted all required delivery work.
    void processPendingNotificationDeliveries().catch((notificationError) => {
      req.log.warn(
        { err: notificationError, appointmentRequestId: row.id },
        "Unable to start appointment request notification delivery",
      );
    });

    res.status(201).json({ id: row.id, status: row.status });
  } catch (_err) {
    res.status(500).json({ error: "Failed to save request. Please try again." });
  }
});

export default router;
