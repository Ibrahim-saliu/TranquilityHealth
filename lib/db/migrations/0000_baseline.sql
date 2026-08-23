CREATE TABLE "appointment_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"preferred_time" text NOT NULL,
	"service_interest" text NOT NULL,
	"preferred_contact_method" text,
	"is_new_patient" boolean,
	"contact_consent" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by_admin_id" text,
	"patient_id" text,
	"converted_to_appointment_id" text,
	CONSTRAINT "appointment_requests_status_check" CHECK ("appointment_requests"."status" IN ('new', 'under_review', 'approved', 'rejected', 'invited'))
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"patient_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 50 NOT NULL,
	"appointment_type" text DEFAULT 'medication_management' NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	CONSTRAINT "appointments_status_check" CHECK ("appointments"."status" IN ('scheduled', 'completed', 'cancelled', 'no_show')),
	CONSTRAINT "appointments_type_check" CHECK ("appointments"."appointment_type" IN ('medication_management', 'psychotherapy', 'initial_evaluation'))
);
--> statement-breakpoint
CREATE TABLE "providers" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text,
	"full_name" text NOT NULL,
	"credentials" text DEFAULT '' NOT NULL,
	"license_state" text DEFAULT 'TX' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"profile_image_url" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"actor_id" text DEFAULT 'system' NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'patient' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"full_name" text,
	"date_of_birth" date,
	"phone" text,
	"address" text,
	"onboarding_status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_records" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"patient_id" text NOT NULL,
	"consent_type" text NOT NULL,
	"document_version" text,
	"signature_method" text DEFAULT 'electronic_checkbox' NOT NULL,
	"ip_address" text,
	"signed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invite_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"used_at" timestamp,
	"role" text DEFAULT 'admin' NOT NULL,
	"appointment_request_id" text,
	CONSTRAINT "invite_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_provider_id_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."providers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "providers" ADD CONSTRAINT "providers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invite_tokens" ADD CONSTRAINT "invite_tokens_appointment_request_id_appointment_requests_id_fk" FOREIGN KEY ("appointment_request_id") REFERENCES "public"."appointment_requests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "providers_user_id_unique" ON "providers" USING btree ("user_id") WHERE "providers"."user_id" IS NOT NULL;