/**
 * Session — /app/session
 *
 * Patient telehealth session page. This is where video calls will take place.
 * Phase 0: Placeholder showing the anticipated session interface.
 *
 * TODO (future phase): Integrate secure video call SDK (e.g., Daily.co, Twilio Video).
 * TODO (Phase 3): Verify patient has an active appointment before showing video.
 * TODO (Phase 3): Log session start/end as AuditLog events.
 * HIPAA NOTE: All session data must be transmitted over encrypted channels.
 *             Video recordings are NOT permitted without explicit written consent.
 */

export default function SessionPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Your Session</h1>
        <p className="mt-2 text-gray-500">
          Secure, private telehealth session.
        </p>
      </div>

      {/* Video call area placeholder */}
      <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl aspect-video flex items-center justify-center mb-6">
        <div className="text-center text-white">
          <p className="text-5xl mb-4">🎥</p>
          <h2 className="text-2xl font-semibold">Video Session</h2>
          <p className="mt-3 text-gray-400 text-sm">
            Secure video call will appear here.
            <br />
            {/* TODO (future phase): Mount video SDK component here */}
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
        {[
          { icon: "🎤", label: "Mute" },
          { icon: "📷", label: "Camera" },
          { icon: "💬", label: "Chat" },
          { icon: "🔴", label: "End Call" },
        ].map((ctrl) => (
          <button
            key={ctrl.label}
            disabled
            className="flex flex-col items-center gap-1 px-5 py-3 bg-gray-100 rounded-xl text-gray-500 opacity-50 cursor-not-allowed"
          >
            <span className="text-xl">{ctrl.icon}</span>
            <span className="text-xs font-medium">{ctrl.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-10 p-4 bg-teal-50 rounded-lg border border-teal-100">
        <p className="text-teal-800 text-sm font-medium">
          📋 Phase 0 — Placeholder. Secure video integration coming in future phases.
        </p>
      </div>
    </div>
  );
}
