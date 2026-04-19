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
  new: "bg-blue-100 text-blue-800",
  under_review: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  invited: "bg-purple-100 text-purple-800",
};

export type ServiceInterest = "therapy" | "medication" | "not_sure";

export const SERVICE_LABELS: Record<ServiceInterest, string> = {
  therapy: "Psychotherapy",
  medication: "Medication Management",
  not_sure: "Not sure yet",
};

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
  createdAt: string;
  expiresAt: string;
  used: boolean;
}

export interface TeamData {
  admins: AdminUser[];
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

export async function validateAdminInviteToken(
  token: string,
): Promise<{ valid: boolean; email?: string; reason?: string }> {
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
// Providers
// ---------------------------------------------------------------------------

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
