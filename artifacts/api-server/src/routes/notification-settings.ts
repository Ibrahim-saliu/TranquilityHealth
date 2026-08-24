import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { adminNotificationRecipientsTable, db } from "@workspace/db";
import { writeAuditLog } from "../lib/audit";
import {
  getNotificationDeliveryConfig,
  normalizeNotificationPhone,
} from "../lib/notifications";
import { requireAuth } from "../lib/session";

const router: IRouter = Router();

/**
 * Session cookies are not sufficient for settings mutations when the API is
 * configured for cross-site cookies. Browser requests must originate from the
 * same host or an explicitly configured SPA origin.
 */
function requireTrustedOrigin(req: Request, res: Response, next: NextFunction): void {
  const origin = req.get("origin");
  if (!origin) {
    res.status(403).json({ error: "A browser origin is required for this action" });
    return;
  }

  const configuredOrigins = (process.env["CORS_ORIGINS"] ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  try {
    const sameHost = new URL(origin).host === req.get("host");
    if (sameHost || configuredOrigins.includes(origin)) {
      next();
      return;
    }
  } catch {
    // Fall through to the uniform forbidden response.
  }

  res.status(403).json({ error: "Untrusted request origin" });
}

const recipientSchema = z.object({
  label: z.string().trim().min(1, "A recipient label is required").max(80),
  email: z.string().trim().email("Enter a valid email address").or(z.literal("")).optional(),
  phone: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

function parseRecipient(body: unknown): {
  label: string;
  email: string | null;
  phone: string | null;
  isActive?: boolean;
} | { error: string } {
  const parsed = recipientSchema.safeParse(body);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid recipient" };

  const email = parsed.data.email?.trim().toLowerCase() || null;
  const phoneInput = parsed.data.phone?.trim() || "";
  const phone = phoneInput ? normalizeNotificationPhone(phoneInput) : null;
  if (phoneInput && !phone) {
    return { error: "Enter a valid phone number with country code, or a 10-digit US number" };
  }
  if (!email && !phone) {
    return { error: "Add at least an email address or phone number" };
  }

  return {
    label: parsed.data.label,
    email,
    phone,
    isActive: parsed.data.isActive,
  };
}

router.get("/admin/notification-settings", requireAuth("admin"), async (_req, res): Promise<void> => {
  try {
    const recipients = await db
      .select()
      .from(adminNotificationRecipientsTable)
      .orderBy(asc(adminNotificationRecipientsTable.label));
    res.json({
      recipients,
      deliveryConfig: getNotificationDeliveryConfig(),
    });
  } catch (_error) {
    res.status(500).json({ error: "Failed to load notification settings" });
  }
});

router.post("/admin/notification-recipients", requireAuth("admin"), requireTrustedOrigin, async (req, res): Promise<void> => {
  const input = parseRecipient(req.body);
  if ("error" in input) {
    res.status(400).json({ error: input.error });
    return;
  }

  try {
    const [recipient] = await db
      .insert(adminNotificationRecipientsTable)
      .values({
        ...input,
        isActive: input.isActive ?? true,
      })
      .returning();
    await writeAuditLog({
      action: "NOTIFICATION_RECIPIENT_CREATED",
      entityType: "notification_recipient",
      entityId: recipient.id,
      actorId: req.session.userId,
    });
    res.status(201).json({ recipient });
  } catch (_error) {
    res.status(500).json({ error: "Failed to add notification recipient" });
  }
});

router.put("/admin/notification-recipients/:id", requireAuth("admin"), requireTrustedOrigin, async (req, res): Promise<void> => {
  const input = parseRecipient(req.body);
  if ("error" in input) {
    res.status(400).json({ error: input.error });
    return;
  }

  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const [recipient] = await db
      .update(adminNotificationRecipientsTable)
      .set({
        ...input,
        isActive: input.isActive ?? true,
        updatedAt: new Date(),
      })
      .where(eq(adminNotificationRecipientsTable.id, id))
      .returning();
    if (!recipient) {
      res.status(404).json({ error: "Notification recipient not found" });
      return;
    }
    await writeAuditLog({
      action: "NOTIFICATION_RECIPIENT_UPDATED",
      entityType: "notification_recipient",
      entityId: recipient.id,
      actorId: req.session.userId,
    });
    res.json({ recipient });
  } catch (_error) {
    res.status(500).json({ error: "Failed to update notification recipient" });
  }
});

// Delivery history stays intact for audit and retry review. "Remove" therefore
// deactivates the recipient instead of deleting their persisted records.
router.delete("/admin/notification-recipients/:id", requireAuth("admin"), requireTrustedOrigin, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  try {
    const [recipient] = await db
      .update(adminNotificationRecipientsTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(adminNotificationRecipientsTable.id, id))
      .returning();
    if (!recipient) {
      res.status(404).json({ error: "Notification recipient not found" });
      return;
    }
    await writeAuditLog({
      action: "NOTIFICATION_RECIPIENT_DEACTIVATED",
      entityType: "notification_recipient",
      entityId: recipient.id,
      actorId: req.session.userId,
    });
    res.status(204).send();
  } catch (_error) {
    res.status(500).json({ error: "Failed to remove notification recipient" });
  }
});

export default router;