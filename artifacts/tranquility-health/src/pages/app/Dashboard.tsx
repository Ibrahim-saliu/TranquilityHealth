/**
 * AppDashboard — /app/dashboard
 *
 * The patient's single-focus "what's next" view. Reached only after onboarding
 * is complete, so it centers on the next appointment and a contextual Join.
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CalendarDays, Video, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { ROUTES } from "@/lib/config/routes";
import {
  listMyAppointments,
  isJoinable,
  APPOINTMENT_TYPE_LABELS,
  type PatientAppointment,
} from "@/lib/patient-api";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
    timeZoneName: "short",
  });
}

export default function AppDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const [upcoming, setUpcoming] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Re-evaluate the join window on an interval so the button appears without a reload.
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    let cancelled = false;
    listMyAppointments("upcoming")
      .then((appts) => !cancelled && setUpcoming(appts))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  const next = upcoming[0];
  const joinable = next ? isJoinable(next, now) : false;

  return (
    <div>
      <div className="mb-7">
        <h1 className="font-serif text-3xl font-bold text-slate-900">Welcome back, {firstName}</h1>
        <p className="mt-1 text-slate-500">Here's what's next in your care.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-5">
        {/* Next appointment */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-7 flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Your next appointment</p>

          {loading ? (
            <div className="flex-1 flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : next ? (
            <div className="flex-1 flex flex-col mt-4">
              <p className="text-lg font-semibold text-slate-900">
                {APPOINTMENT_TYPE_LABELS[next.appointmentType] ?? next.appointmentType}
              </p>
              <p className="mt-1 text-sm text-slate-600">{formatWhen(next.scheduledAt)}</p>
              {next.providerName && (
                <p className="mt-1 text-sm text-slate-500">
                  with {next.providerName}
                  {next.providerCredentials ? `, ${next.providerCredentials}` : ""}
                </p>
              )}

              <div className="mt-6 pt-5 border-t border-slate-100">
                {joinable ? (
                  <Link
                    href={ROUTES.app.session}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 transition-colors"
                  >
                    <Video className="w-4 h-4" strokeWidth={2} />
                    Join session
                  </Link>
                ) : (
                  <p className="text-xs text-slate-400">
                    The Join button appears here 10 minutes before your visit starts.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <CalendarDays className="w-10 h-10 text-slate-300 mb-3" strokeWidth={1.5} />
              <p className="text-base font-semibold text-slate-800">No upcoming appointments</p>
              <p className="mt-1.5 text-sm text-slate-500 max-w-xs">
                Your care coordinator will reach out to schedule your first visit. It'll appear here, with a
                button to join when it's time.
              </p>
            </div>
          )}
        </section>

        {/* At a glance */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">At a glance</p>
          <p className="mt-4 text-4xl font-bold text-slate-900 tabular-nums">
            {loading ? "—" : upcoming.length}
          </p>
          <p className="text-sm text-slate-500">
            upcoming {upcoming.length === 1 ? "appointment" : "appointments"}
          </p>

          <Link
            href={ROUTES.app.appointments}
            className="mt-6 inline-flex items-center justify-center gap-1.5 w-full px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            View all appointments
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </Link>
        </section>
      </div>
    </div>
  );
}
