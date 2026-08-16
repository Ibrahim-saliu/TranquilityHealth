/**
 * Session — /app/session
 *
 * Patient telehealth session page — the room where a video visit takes place.
 * The video experience is not wired up yet; this renders the session shell.
 *
 * When the call SDK is integrated, it must run over encrypted channels only,
 * gate entry on an active appointment, and never record without written consent.
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
    </div>
  );
}
