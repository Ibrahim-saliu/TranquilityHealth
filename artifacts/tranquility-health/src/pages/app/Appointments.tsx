/**
 * Appointments — /app/appointments
 *
 * The patient's own visits, split into Upcoming and Past. Joining is a
 * contextual action that appears on an appointment only inside its join
 * window — patients don't self-schedule in this version (view & join).
 */

import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { CalendarDays, Video, Loader2 } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";
import {
  listMyAppointments,
  isJoinable,
  APPOINTMENT_TYPE_LABELS,
  type PatientAppointment,
} from "@/lib/patient-api";

type Tab = "upcoming" | "past";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-teal-100 text-teal-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-100 text-slate-600",
  no_show: "bg-red-100 text-red-700",
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
    timeZoneName: "short",
  });
}

export default function AppointmentsPage() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async (t: Tab) => {
    setLoading(true);
    setError(null);
    try {
      setAppointments(await listMyAppointments(t));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-slate-900">My appointments</h1>
        <p className="mt-1 text-slate-500">Your scheduled and past visits.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {(["upcoming", "past"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-teal-600 text-teal-700 bg-teal-50"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t === "upcoming" ? "Upcoming" : "Past"}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-16 text-center text-slate-400">
          <Loader2 className="w-6 h-6 mx-auto animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
          <CalendarDays className="w-10 h-10 mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-slate-900">
            {tab === "upcoming" ? "No upcoming appointments" : "No past appointments"}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            {tab === "upcoming"
              ? "Your care coordinator will schedule your visits. They'll show up here."
              : "Your completed visits will appear here."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {appointments.map((appt) => {
            const joinable = isJoinable(appt, now);
            return (
              <li
                key={appt.id}
                className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <p className="font-semibold text-slate-900">
                      {APPOINTMENT_TYPE_LABELS[appt.appointmentType] ?? appt.appointmentType}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        STATUS_COLORS[appt.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {STATUS_LABELS[appt.status] ?? appt.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{formatWhen(appt.scheduledAt)}</p>
                  {appt.providerName && (
                    <p className="text-sm text-slate-500">
                      with {appt.providerName}
                      {appt.providerCredentials ? `, ${appt.providerCredentials}` : ""} · {appt.durationMinutes} min
                    </p>
                  )}
                </div>

                {joinable && (
                  <Link
                    href={ROUTES.app.session}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 transition-colors"
                  >
                    <Video className="w-4 h-4" strokeWidth={2} />
                    Join
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
