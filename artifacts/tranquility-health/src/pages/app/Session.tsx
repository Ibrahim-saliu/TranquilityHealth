/**
 * Session — /app/session
 *
 * The telehealth room. Entry is gated on having an appointment inside its join
 * window — a patient can't sit in an empty room hours early or replay a past
 * visit. The video SDK itself is the remaining integration; when wired it must
 * run over encrypted channels only and never record without written consent.
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Video, Mic, Camera, MessageSquare, PhoneOff, CalendarClock, Loader2, type LucideIcon } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";
import {
  listMyAppointments,
  isJoinable,
  APPOINTMENT_TYPE_LABELS,
  type PatientAppointment,
} from "@/lib/patient-api";

const controls: { Icon: LucideIcon; label: string }[] = [
  { Icon: Mic, label: "Mute" },
  { Icon: Camera, label: "Camera" },
  { Icon: MessageSquare, label: "Chat" },
  { Icon: PhoneOff, label: "Leave" },
];

export default function SessionPage() {
  const [active, setActive] = useState<PatientAppointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listMyAppointments("upcoming")
      .then((appts) => {
        if (cancelled) return;
        setActive(appts.find((a) => isJoinable(a)) ?? null);
      })
      .catch(() => !cancelled && setActive(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center text-slate-400">
        <Loader2 className="w-6 h-6 mx-auto animate-spin" />
      </div>
    );
  }

  // No appointment is currently joinable — don't open an empty room.
  if (!active) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <CalendarClock className="w-12 h-12 mx-auto mb-5 text-slate-300" strokeWidth={1.5} />
        <h1 className="font-serif text-2xl font-bold text-slate-900">No session to join right now</h1>
        <p className="mt-2 text-slate-500">
          The session room opens 10 minutes before your appointment. You can join from your dashboard when it's time.
        </p>
        <Link
          href={ROUTES.app.dashboard}
          className="mt-6 inline-flex items-center px-5 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-slate-900">Your session</h1>
        <p className="mt-1.5 text-slate-500">
          {APPOINTMENT_TYPE_LABELS[active.appointmentType] ?? active.appointmentType}
          {active.providerName ? ` with ${active.providerName}` : ""}
          {active.providerCredentials ? `, ${active.providerCredentials}` : ""}
        </p>
      </div>

      {/* Video area — SDK integration pending; the room is gated and ready. */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl aspect-video flex items-center justify-center mb-6">
        <div className="text-center text-white px-4">
          <Video className="w-12 h-12 mx-auto mb-4 text-teal-300" strokeWidth={1.5} />
          <h2 className="text-2xl font-semibold">You're in the room</h2>
          <p className="mt-3 text-slate-400 text-sm max-w-sm">
            Secure video launches here. Your provider joins at your appointment time — keep this tab open.
          </p>
        </div>
      </div>

      {/* Controls — enabled once the call SDK is connected. */}
      <div className="flex justify-center gap-4">
        {controls.map(({ Icon, label }) => (
          <button
            key={label}
            disabled
            className="flex flex-col items-center gap-1.5 px-5 py-3 bg-slate-100 rounded-xl text-slate-500 opacity-50 cursor-not-allowed"
          >
            <Icon className="w-5 h-5" strokeWidth={1.75} />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
