ALTER TABLE "notification_deliveries" ADD COLUMN IF NOT EXISTS "lease_token" text;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD COLUMN IF NOT EXISTS "lease_expires_at" timestamp;
