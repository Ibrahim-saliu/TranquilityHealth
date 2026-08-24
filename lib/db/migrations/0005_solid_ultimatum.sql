ALTER TABLE "notification_deliveries" ADD COLUMN "lease_token" text;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD COLUMN "lease_expires_at" timestamp;