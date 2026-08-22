import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  listPatients,
  listProviders,
  createAppointment,
  APPOINTMENT_TYPE_LABELS,
  type PatientOption,
  type Provider,
  type AppointmentType,
} from "@/lib/admin-api";

interface ScheduleAppointmentDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const TYPES = Object.keys(APPOINTMENT_TYPE_LABELS) as AppointmentType[];
const fieldClass =
  "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:border-teal-600";
const labelClass = "block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5";

export function ScheduleAppointmentDialog({ open, onClose, onCreated }: ScheduleAppointmentDialogProps) {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  const [patientId, setPatientId] = useState("");
  const [providerId, setProviderId] = useState("");
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("medication_management");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    // Reset the form each time the dialog opens.
    setPatientId("");
    setProviderId("");
    setAppointmentType("medication_management");
    setScheduledAt("");
    setDurationMinutes(50);
    setNotes("");
    setError(null);

    let cancelled = false;
    setLoadingLists(true);
    Promise.all([listPatients(), listProviders()])
      .then(([p, pr]) => {
        if (cancelled) return;
        setPatients(p);
        setProviders(pr.filter((x) => x.isActive));
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed to load form data"))
      .finally(() => !cancelled && setLoadingLists(false));
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!patientId || !providerId || !scheduledAt) {
      setError("Patient, provider, and date/time are required.");
      return;
    }
    setSubmitting(true);
    try {
      await createAppointment({
        patientId,
        providerId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        appointmentType,
        durationMinutes,
        notes: notes.trim() || undefined,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule appointment");
    } finally {
      setSubmitting(false);
    }
  }

  const noPatients = !loadingLists && patients.length === 0;
  const noProviders = !loadingLists && providers.length === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Schedule appointment"
        className="w-full max-w-md bg-white rounded-2xl shadow-xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-serif text-lg font-semibold text-slate-900">Schedule appointment</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <div>
            <label className={labelClass} htmlFor="appt-patient">Patient</label>
            <select
              id="appt-patient"
              className={fieldClass}
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              disabled={loadingLists || noPatients}
            >
              <option value="">{loadingLists ? "Loading…" : noPatients ? "No patient accounts yet" : "Select a patient…"}</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName ?? p.email ?? p.id}
                  {p.onboardingStatus !== "complete" ? " · onboarding pending" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="appt-provider">Provider</label>
            <select
              id="appt-provider"
              className={fieldClass}
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              disabled={loadingLists || noProviders}
            >
              <option value="">{loadingLists ? "Loading…" : noProviders ? "No active providers" : "Select a provider…"}</option>
              {providers.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.fullName}
                  {pr.credentials ? `, ${pr.credentials}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="appt-type">Type</label>
              <select
                id="appt-type"
                className={fieldClass}
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value as AppointmentType)}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{APPOINTMENT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="appt-duration">Duration (min)</label>
              <input
                id="appt-duration"
                type="number"
                min={15}
                max={240}
                step={5}
                className={fieldClass}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="appt-when">Date &amp; time</label>
            <input
              id="appt-when"
              type="datetime-local"
              className={fieldClass}
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="appt-notes">Notes <span className="normal-case font-normal text-slate-400">(optional)</span></label>
            <textarea
              id="appt-notes"
              rows={2}
              className={fieldClass}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || noPatients || noProviders}
              className="px-4 py-2 text-sm font-semibold text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Scheduling…" : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
