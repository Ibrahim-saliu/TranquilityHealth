/**
 * AdminAppointments — /admin/appointments
 *
 * Live list of all scheduled appointments joined with patient and provider info.
 * Supports filtering by Upcoming / Past / All and sorts chronologically.
 */

import { useEffect, useState, useCallback } from "react";
import { CalendarDays, Plus } from "lucide-react";
import {
  listAppointments,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_TYPE_LABELS,
  type Appointment,
  type AppointmentView,
} from "@/lib/admin-api";
import { ScheduleAppointmentDialog } from "@/components/admin/ScheduleAppointmentDialog";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
    timeZoneName: "short",
  });
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

function ApptStatusBadge({ status }: { status: string }) {
  const label = APPOINTMENT_STATUS_LABELS[status as keyof typeof APPOINTMENT_STATUS_LABELS] ?? status;
  const color = APPOINTMENT_STATUS_COLORS[status as keyof typeof APPOINTMENT_STATUS_COLORS] ?? "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Filter tabs
// ---------------------------------------------------------------------------

const VIEWS: { value: AppointmentView; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
];

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function AdminAppointmentsPage() {
  const [view, setView] = useState<AppointmentView>("upcoming");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const load = useCallback(async (v: AppointmentView) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAppointments(v, 1, 50);
      setAppointments(data.appointments);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(view);
  }, [view, load]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
          <p className="mt-1 text-slate-500">
            All scheduled sessions across providers and patients.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400 tabular-nums">
            {loading ? "Loading…" : `${total} total`}
          </span>
          <button
            onClick={() => setScheduleOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.2} />
            Schedule appointment
          </button>
        </div>
      </div>

      <ScheduleAppointmentDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onCreated={() => {
          setView("upcoming");
          load("upcoming");
        }}
      />

      {/* Filter tabs */}
      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {VIEWS.map(({ value: v, label }) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
              view === v
                ? "border-teal-600 text-teal-700 bg-teal-50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["Date & Time", "Patient", "Provider", "Type", "Status"].map((col) => (
                <th
                  key={col}
                  className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                  <CalendarDays className="w-10 h-10 mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
                  <p className="text-base font-medium text-slate-500">No appointments yet</p>
                  <p className="text-sm mt-1 text-slate-400">
                    {view === "upcoming"
                      ? "No upcoming sessions scheduled."
                      : view === "past"
                        ? "No past sessions found."
                        : "Appointments will appear here once they are scheduled."}
                  </p>
                </td>
              </tr>
            ) : (
              appointments.map((appt) => (
                <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                    {formatDateTime(appt.scheduledAt)}
                    <span className="block text-xs text-slate-400 font-normal mt-0.5">
                      {appt.durationMinutes} min
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {appt.patientName ? (
                      appt.patientName
                    ) : appt.patientEmail ? (
                      <span className="text-slate-600">{appt.patientEmail}</span>
                    ) : (
                      <span className="text-slate-400 italic">Unknown patient</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {appt.providerName ? (
                      <>
                        {appt.providerName}
                        {appt.providerCredentials && (
                          <span className="block text-xs text-slate-400 mt-0.5">
                            {appt.providerCredentials}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-slate-400 italic">Unknown provider</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {APPOINTMENT_TYPE_LABELS[appt.appointmentType] ?? appt.appointmentType}
                  </td>
                  <td className="px-6 py-4">
                    <ApptStatusBadge status={appt.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination hint when over 50 */}
      {!loading && total > 50 && (
        <p className="mt-3 text-xs text-slate-400 text-right">
          Showing 50 of {total} appointments.
        </p>
      )}
    </div>
  );
}
