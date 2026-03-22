/**
 * AdminRequests — /admin/requests
 *
 * Lists all incoming appointment requests for admin review and action.
 * Phase 0: Placeholder with anticipated table layout.
 *
 * TODO (future phase): Load from AppointmentRequest model in DB.
 * TODO (future phase): Allow admin to approve, decline, or assign a provider.
 * TODO (Phase 3): Changes to requests should create AuditLog entries.
 */

export default function AdminRequestsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Requests</h1>
          <p className="mt-1 text-gray-500">Review and manage incoming patient requests.</p>
        </div>
        <div className="flex gap-3">
          <button
            disabled
            className="px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-500 opacity-50 cursor-not-allowed"
          >
            Filter (Coming Soon)
          </button>
        </div>
      </div>

      {/* Request table placeholder */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Patient", "Date Submitted", "Service Type", "Status", "Actions"].map((col) => (
                <th key={col} className="text-left px-6 py-4 text-gray-600 font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                <p className="text-4xl mb-3">📬</p>
                <p className="text-sm">No appointment requests yet.</p>
                <p className="text-xs mt-1">
                  {/* TODO (Phase 3): Fetch from AppointmentRequest model */}
                  Requests will appear here once patients submit intake forms.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-100">
        <p className="text-amber-800 text-sm font-medium">
          📋 Phase 0 — Placeholder. Request management coming in future phases.
        </p>
      </div>
    </div>
  );
}
