import { API_BASE_URL } from "@/lib/config/env";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type RequestStatus = "new" | "under_review" | "approved" | "rejected" | "invited";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  new: "New",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  invited: "Invited",
};

export const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  new: "bg-teal-100 text-teal-800",
  under_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  invited: "bg-slate-100 text-slate-700",
};

export type ServiceInterest = "therapy" | "medication" | "not_sure";

export const SERVICE_LABELS: Record<ServiceInterest, string> = {
  therapy: "Psychotherapy",
  medication: "Medication Management",
  not_sure: "Not sure yet",
};

// Preferred-time slugs come from the public intake form's select. Map them to
// readable labels; unknown values fall back to a title-cased slug.
export const PREFERRED_TIME_LABELS: Record<string, string> = {
  weekday_evenings: "Weekday evenings (Mon–Thu, 5–9 PM)",
  friday_morning: "Friday morning (8 AM–1 PM)",
  friday_afternoon: "Friday afternoon (3–7 PM)",
  saturday_morning: "Saturday morning (8 AM–12 PM)",
  saturday_afternoon: "Saturday afternoon (12–4 PM)",
};

export function formatPreferredTime(value: string): string {
  return PREFERRED_TIME_LABELS[value] ?? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface AppointmentRequest {
  id: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  email: string;
  phone: string;
  preferredTime: string;
  serviceInterest: ServiceInterest;
  preferredContactMethod: "phone" | "email" | null;
  isNewPatient: boolean | null;
  contactConsent: boolean;
  status: RequestStatus;
  reviewedAt: string | null;
  reviewedByAdminId: string | null;
}

export interface Provider {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  fullName: string;
  credentials: string;
  licenseState: string;
  bio: string;
  profileImageUrl: string | null;
  isActive: boolean;
}

export interface ProviderInput {
  fullName: string;
  credentials: string;
  licenseState: string;
  bio: string;
  profileImageUrl: string;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return body as T;
}

// ---------------------------------------------------------------------------
// Appointment requests
// ---------------------------------------------------------------------------

export interface RequestsPage {
  requests: AppointmentRequest[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listRequests(
  status?: RequestStatus,
  page = 1,
  pageSize = 20,
): Promise<RequestsPage> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  const data = await apiFetch<RequestsPage>(`/admin/requests?${params.toString()}`);
  return data;
}

export async function getRequestCounts(): Promise<Record<string, number>> {
  const data = await apiFetch<{ counts: Record<string, number> }>("/admin/requests/counts");
  return data.counts;
}

export async function getRequest(id: string): Promise<AppointmentRequest> {
  const data = await apiFetch<{ request: AppointmentRequest }>(`/admin/requests/${id}`);
  return data.request;
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
): Promise<{ id: string; status: RequestStatus }> {
  const data = await apiFetch<{ request: { id: string; status: RequestStatus } }>(
    `/admin/requests/${id}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
  return data.request;
}

// ---------------------------------------------------------------------------
// Team management
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface PendingInvite {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
}

export interface TeamData {
  members: AdminUser[];
  pendingInvites: PendingInvite[];
}

export async function getTeam(): Promise<TeamData> {
  return apiFetch<TeamData>("/admin/team");
}

export async function inviteStaff(email: string): Promise<{ inviteUrl: string }> {
  return apiFetch<{ inviteUrl: string }>("/admin/invite-staff", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function inviteProvider(email: string): Promise<{ inviteUrl: string }> {
  return apiFetch<{ inviteUrl: string }>("/admin/invite-provider", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resendInvite(email: string): Promise<{ inviteUrl: string }> {
  return apiFetch<{ inviteUrl: string }>("/admin/invite-staff/resend", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function deleteCollaborator(userId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/team/${userId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
}

export async function validateAdminInviteToken(
  token: string,
): Promise<{ valid: boolean; email?: string; role?: string; reason?: string }> {
  const res = await fetch(`${API_BASE_URL}/admin/accept-invite/${token}/validate`, {
    credentials: "include",
  });
  return res.json();
}

export async function acceptAdminInvite(
  token: string,
  password: string,
): Promise<{ user: { id: string; email: string; role: string } }> {
  return apiFetch(`/admin/accept-invite/${token}`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type AppointmentType = "medication_management" | "psychotherapy" | "initial_evaluation";
export type AppointmentView = "upcoming" | "past" | "all";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled: "bg-teal-100 text-teal-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-100 text-slate-600",
  no_show: "bg-red-100 text-red-700",
};

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  medication_management: "Medication Mgmt",
  psychotherapy: "Psychotherapy",
  initial_evaluation: "Initial Evaluation",
};

export interface Appointment {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  patientId: string;
  patientName: string | null;
  patientEmail: string | null;
  providerId: string;
  providerName: string | null;
  providerCredentials: string | null;
}

export interface AppointmentsPage {
  appointments: Appointment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listAppointments(
  view: AppointmentView = "all",
  page = 1,
  pageSize = 50,
): Promise<AppointmentsPage> {
  const params = new URLSearchParams({ view, page: String(page), pageSize: String(pageSize) });
  return apiFetch<AppointmentsPage>(`/admin/appointments?${params.toString()}`);
}

export interface PatientOption {
  id: string;
  fullName: string | null;
  email: string | null;
  onboardingStatus: string;
}

/** List patient accounts, for pickers (admin + collaborator only). */
export async function listPatients(): Promise<PatientOption[]> {
  const data = await apiFetch<{ patients: PatientOption[] }>("/admin/patients");
  return data.patients;
}

export interface CreateAppointmentInput {
  patientId: string;
  providerId: string;
  scheduledAt: string; // ISO 8601
  appointmentType: AppointmentType;
  durationMinutes?: number;
  notes?: string;
}

/** Schedule an appointment (admin + collaborator only). */
export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const data = await apiFetch<{ appointment: Appointment }>("/admin/appointments", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.appointment;
}

/** Cancel a scheduled appointment (admin + collaborator only). */
export async function cancelAppointment(id: string, reason?: string): Promise<Appointment> {
  const data = await apiFetch<{ appointment: Appointment }>(`/admin/appointments/${id}/cancel`, {
    method: "POST",
    body: JSON.stringify(reason ? { reason } : {}),
  });
  return data.appointment;
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

/** List all provider profiles (admin + collaborator only). */
export async function listProviders(): Promise<Provider[]> {
  const data = await apiFetch<{ providers: Provider[] }>("/admin/providers");
  return data.providers;
}

/** Create a new provider profile (admin only). */
export async function createProvider(input: ProviderInput): Promise<Provider> {
  const data = await apiFetch<{ provider: Provider }>("/admin/providers", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.provider;
}

/** Update an existing provider profile by ID (admin only). */
export async function updateProvider(id: string, input: ProviderInput): Promise<Provider> {
  const data = await apiFetch<{ provider: Provider }>(`/admin/providers/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return data.provider;
}

/** Get the provider profile linked to the currently signed-in provider user. */
export async function getMyProviderProfile(): Promise<Provider | null> {
  const data = await apiFetch<{ provider: Provider | null }>("/providers/me");
  return data.provider;
}

/** Update the currently signed-in provider's own profile. */
export async function updateMyProviderProfile(input: ProviderInput): Promise<Provider> {
  const data = await apiFetch<{ provider: Provider }>("/providers/me", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return data.provider;
}

/** Legacy — returns the first active provider. Still used by ProviderDashboard fallback. */
export async function getActiveProvider(): Promise<Provider | null> {
  const data = await apiFetch<{ provider: Provider | null }>("/admin/providers/active");
  return data.provider;
}

export async function upsertProvider(input: ProviderInput): Promise<Provider> {
  const data = await apiFetch<{ provider: Provider }>("/admin/providers/active", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return data.provider;
}
