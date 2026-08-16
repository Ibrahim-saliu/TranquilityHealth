/**
 * Appointments — /app/appointments
 *
 * Patient-facing view of upcoming, past, and cancelled visits. Renders an empty
 * state until appointment data and scheduling actions are wired to the API.
 */

import { CalendarDays } from "lucide-react";

export default function AppointmentsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Appointments</h1>
          <p className="mt-1 text-slate-500">View and manage your upcoming sessions.</p>
        </div>
        <button
          disabled
          className="px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-lg text-sm opacity-50 cursor-not-allowed"
        >
          + Schedule New (Coming Soon)
        </button>
      </div>

      {/* Tabs placeholder */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        {["Upcoming", "Past", "Cancelled"].map((tab, idx) => (
          <button
            key={tab}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              idx === 0
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-12 text-center">
        <CalendarDays className="w-10 h-10 mx-auto mb-4 text-slate-300" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold text-slate-900">No appointments yet</h3>
        <p className="mt-2 text-sm text-slate-500">
          Your upcoming sessions will appear here.
        </p>
      </div>
    </div>
  );
}
