/**
 * AdminAppointments — /admin/appointments
 *
 * Admin view of all scheduled appointments across all providers and patients.
 * Phase 0: Placeholder with anticipated calendar/list layout.
 *
 * TODO (future phase): Load from Appointment model with full join to Patient + Provider.
 * TODO (future phase): Add calendar view, list view toggle.
 * TODO (Phase 3): All appointment changes logged to AuditLog.
 */

export default function AdminAppointmentsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
          <p className="mt-1 text-slate-500">
            All scheduled sessions across providers and patients.
          </p>
        </div>
        <div className="flex gap-3">
          {["List View", "Calendar View"].map((view, idx) => (
            <button
              key={view}
              disabled
              className={`px-4 py-2 text-sm font-medium rounded-lg opacity-50 cursor-not-allowed ${
                idx === 0
                  ? "bg-gradient-to-r from-teal-600 to-indigo-600 text-white"
                  : "border border-slate-200 text-slate-500"
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments table placeholder */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["Date & Time", "Patient", "Provider", "Type", "Status"].map((col) => (
                <th key={col} className="text-left px-6 py-4 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                <p className="text-4xl mb-3">🗓️</p>
                <p className="text-sm">No appointments scheduled yet.</p>
                <p className="text-xs mt-1">
                  {/* TODO (Phase 3): Fetch from Appointment model */}
                  Appointments will appear here once they are scheduled.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-100">
        <p className="text-amber-800 text-sm font-medium">
          📋 Phase 0 — Placeholder. Appointment management coming in future phases.
        </p>
      </div>
    </div>
  );
}
