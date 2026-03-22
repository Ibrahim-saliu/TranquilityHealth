/**
 * AppDashboard — /app/dashboard
 *
 * Patient-facing dashboard. Entry point after login.
 * Phase 0: Placeholder showing anticipated dashboard structure.
 *
 * TODO (Phase 3): Populate with real patient data:
 *   - Upcoming appointments
 *   - Recent messages from provider
 *   - Outstanding action items (consent forms, questionnaires)
 * TODO (Phase 3): Add authentication guard — redirect to login if unauthenticated.
 */

export default function AppDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="mt-2 text-gray-500">
          Welcome back. Here's a summary of your care.
          {/* TODO (Phase 3): Replace "your care" with patient name */}
        </p>
      </div>

      {/* Dashboard widgets placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Upcoming Appointments", value: "—", icon: "📅" },
          { label: "Messages", value: "—", icon: "💬" },
          { label: "Action Items", value: "—", icon: "✅" },
        ].map((widget) => (
          <div
            key={widget.label}
            className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{widget.icon}</span>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                  {widget.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{widget.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Appointment list placeholder */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Appointments</h2>
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-sm">No appointments yet.</p>
          <p className="text-xs mt-1">
            {/* TODO (Phase 3): Replace with actual appointment list */}
            Appointment data will appear here after scheduling.
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-teal-50 rounded-lg border border-teal-100">
        <p className="text-teal-800 text-sm font-medium">
          📋 Phase 0 — Placeholder dashboard. Real data integration coming in future phases.
        </p>
      </div>
    </div>
  );
}
