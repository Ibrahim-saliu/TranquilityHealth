/**
 * Session — /app/session
 *
 * Patient telehealth session page — the room where a video visit takes place.
 * The video experience is not wired up yet; this renders the session shell.
 *
 * When the call SDK is integrated, it must run over encrypted channels only,
 * gate entry on an active appointment, and never record without written consent.
 */

import { Video, Mic, Camera, MessageSquare, PhoneOff, type LucideIcon } from "lucide-react";

const controls: { Icon: LucideIcon; label: string }[] = [
  { Icon: Mic, label: "Mute" },
  { Icon: Camera, label: "Camera" },
  { Icon: MessageSquare, label: "Chat" },
  { Icon: PhoneOff, label: "End Call" },
];

export default function SessionPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Your Session</h1>
        <p className="mt-2 text-slate-500">
          Secure, private telehealth session.
        </p>
      </div>

      {/* Video call area placeholder */}
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl aspect-video flex items-center justify-center mb-6">
        <div className="text-center text-white px-4">
          <Video className="w-12 h-12 mx-auto mb-4 text-teal-300" strokeWidth={1.5} />
          <h2 className="text-2xl font-semibold">Video Session</h2>
          <p className="mt-3 text-slate-400 text-sm">
            Your provider will start the call at your appointment time.
          </p>
          <button
            disabled
            className="mt-6 px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg opacity-50 cursor-not-allowed text-sm"
          >
            Join Session (Coming Soon)
          </button>
        </div>
      </div>

      {/* Session controls placeholder */}
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
