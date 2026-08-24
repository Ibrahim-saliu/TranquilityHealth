CREATE TABLE "admin_notification_recipients" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"label" text NOT NULL,
	"email" text,
	"phone" text,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "admin_notification_recipient_contact_check" CHECK ("admin_notification_recipients"."email" IS NOT NULL OR "admin_notification_recipients"."phone" IS NOT NULL)
);
--> statement-breakpoint
CREATE TABLE "notification_deliveries" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"appointment_request_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"channel" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"provider_message_id" text,
	"last_error_code" text,
	"next_attempt_at" timestamp DEFAULT now(),
	"sent_at" timestamp,
	CONSTRAINT "notification_deliveries_channel_check" CHECK ("notification_deliveries"."channel" IN ('email', 'sms')),
	CONSTRAINT "notification_deliveries_status_check" CHECK ("notification_deliveries"."status" IN ('pending', 'sending', 'sent', 'failed', 'cancelled'))
);
--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_appointment_request_id_appointment_requests_id_fk" FOREIGN KEY ("appointment_request_id") REFERENCES "public"."appointment_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ADD CONSTRAINT "notification_deliveries_recipient_id_admin_notification_recipients_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."admin_notification_recipients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "notification_delivery_request_recipient_channel_uq" ON "notification_deliveries" USING btree ("appointment_request_id","recipient_id","channel");