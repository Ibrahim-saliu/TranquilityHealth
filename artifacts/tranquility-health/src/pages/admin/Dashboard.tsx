/**
 * AdminDashboard — /admin/dashboard
 *
 * Admin overview dashboard showing key operational metrics.
 * Phase 0: Placeholder with anticipated widget layout.
 *
 * TODO (future phase): Pull real metrics from DB:
 *   - Pending appointment requests count
 *   - Appointments today
 *   - Provider utilization
 *   - Recent audit log entries
 * TODO (Phase 3): Add admin role guard — only users with role=admin can access.
 */

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-500">
          Operational overview for Tranquility Health.
        </p>
      </div>

      {/* Metric widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-10">
        {[
          { label: "Pending Requests", value: "—", color: "bg-amber-50 border-amber-200", textColor: "text-amber-700" },
          { label: "Appointments Today", value: "—", color: "bg-blue-50 border-blue-200", textColor: "text-blue-700" },
          { label: "Active Providers", value: "—", color: "bg-teal-50 border-teal-200", textColor: "text-teal-700" },
          { label: "Total Patients", value: "—", color: "bg-purple-50 border-purple-200", textColor: "text-purple-700" },
        ].map((widget) => (
          <div
            key={widget.label}
            className={`p-5 rounded-xl border ${widget.color}`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wider ${widget.textColor}`}>
              {widget.label}
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{widget.value}</p>
            {/* TODO (Phase 3): Fetch from DB */}
          </div>
        ))}
      </div>

      {/* Recent activity placeholder */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">Audit log entries will appear here.</p>
          <p className="text-xs mt-1">
            {/* TODO (Phase 3): Pull from AuditLog model */}
            Connected to AuditLog in Phase 3.
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-100">
        <p className="text-amber-800 text-sm font-medium">
          📋 Phase 0 — Placeholder admin dashboard. Real data and RBAC coming in future phases.
        </p>
      </div>
    </div>
  );
}
