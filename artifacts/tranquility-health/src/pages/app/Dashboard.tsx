import { useAuth } from "@/lib/auth/context";

export default function AppDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Patient Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Welcome back{user?.email ? `, ${user.email}` : ""}. Here's a summary of your care.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {[
          { label: "Upcoming Appointments", value: "—", icon: "📅" },
          { label: "Messages", value: "—", icon: "💬" },
          { label: "Action Items", value: "—", icon: "✅" },
        ].map((widget) => (
          <div
            key={widget.label}
            className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{widget.icon}</span>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                  {widget.label}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{widget.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Appointments</h2>
        <div className="text-center py-10 text-slate-400">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-sm">No appointments yet.</p>
          <p className="text-xs mt-1 text-slate-400">
            Appointment scheduling will be available in the next phase.
          </p>
        </div>
      </div>
    </div>
  );
}
