import { Calendar, MessageSquare, CheckCircle2, CalendarDays } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

const widgets = [
  { label: "Upcoming Appointments", value: "—", Icon: Calendar },
  { label: "Messages", value: "—", Icon: MessageSquare },
  { label: "Action Items", value: "—", Icon: CheckCircle2 },
];

export default function AppDashboardPage() {
  const { user } = useAuth();

  // Display name: patient's full name if set, fallback to email
  const displayName = user?.name ?? user?.email ?? "there";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Patient Dashboard</h1>
        <p className="mt-2 text-slate-500">
          Welcome back, <span className="font-medium text-slate-700">{displayName}</span>.
          Here's a summary of your care.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {widgets.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-teal-50 text-teal-600">
                <Icon className="w-5 h-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                  {label}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Appointments</h2>
        <div className="text-center py-12 text-slate-400">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 text-slate-300" strokeWidth={1.5} />
          <p className="text-sm text-slate-500">No appointments yet.</p>
          <p className="text-xs mt-1 text-slate-400">
            Appointment scheduling will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
