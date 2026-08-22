import { API_BASE_URL } from "@/lib/config/env";

// ---------------------------------------------------------------------------
// Patient-facing API client. Mirrors the admin-api pattern: a thin apiFetch
// wrapper plus typed helpers. Every call is scoped to the signed-in patient
// server-side (routes are guarded by requireAuth("patient")).
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const issue = (body as { issues?: { message: string }[] }).issues?.[0]?.message;
    throw new Error((body as { error?: string }).error ?? issue ?? `HTTP ${res.status}`);
  }
  return body as T;
}

// ---------------------------------------------------------------------------
// Appointment types + labels (patient-facing subset)
// ---------------------------------------------------------------------------

export type AppointmentType = "medication_management" | "psychotherapy" | "initial_evaluation";
export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";
export type AppointmentView = "upcoming" | "past" | "all";

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  medication_management: "Medication management",
  psychotherapy: "Psychotherapy",
  initial_evaluation: "Initial evaluation",
};

export interface PatientAppointment {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  providerName: string | null;
  providerCredentials: string | null;
}

export async function listMyAppointments(
  view: AppointmentView = "upcoming",
): Promise<PatientAppointment[]> {
  const data = await apiFetch<{ appointments: PatientAppointment[] }>(
    `/me/appointments?view=${view}`,
  );
  return data.appointments;
}

// ---------------------------------------------------------------------------
// Join window — a visit can be joined from 10 minutes before it starts until
// it ends. Kept here so the dashboard, appointment list, and session page all
// agree on when the "Join" action appears.
// ---------------------------------------------------------------------------
const JOIN_LEAD_MS = 10 * 60 * 1000;

export function isJoinable(appt: PatientAppointment, now: number = Date.now()): boolean {
  if (appt.status !== "scheduled") return false;
  const start = new Date(appt.scheduledAt).getTime();
  const end = start + appt.durationMinutes * 60_000;
  return now >= start - JOIN_LEAD_MS && now <= end;
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

export interface OnboardingState {
  onboardingStatus: "pending" | "complete";
  fullName: string | null;
  dateOfBirth: string | null;
  phone: string | null;
  address: string | null;
  consents: string[];
}

export interface OnboardingInput {
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  phone: string;
  address?: string;
  consents: { hipaa: true; telehealth: true };
}

export async function getOnboarding(): Promise<OnboardingState> {
  const data = await apiFetch<{ onboarding: OnboardingState }>("/me/onboarding");
  return data.onboarding;
}

export async function submitOnboarding(input: OnboardingInput): Promise<OnboardingState> {
  const data = await apiFetch<{ onboarding: OnboardingState }>("/me/onboarding", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.onboarding;
}
