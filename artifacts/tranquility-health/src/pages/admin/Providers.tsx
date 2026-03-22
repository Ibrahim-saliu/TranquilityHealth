/**
 * AdminProviders — /admin/providers
 *
 * Admin management of provider roster.
 * Phase 0: Placeholder with anticipated provider card layout.
 *
 * TODO (future phase): Load from Provider model in DB.
 * TODO (future phase): Allow admin to add/edit/deactivate providers.
 * TODO (Phase 3): Provider changes should be logged to AuditLog with userId.
 */

export default function AdminProvidersPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Providers</h1>
          <p className="mt-1 text-gray-500">Manage the Tranquility Health clinical team.</p>
        </div>
        <button
          disabled
          className="px-5 py-2.5 bg-gray-900 text-white font-semibold rounded-lg text-sm opacity-50 cursor-not-allowed"
        >
          + Add Provider (Coming Soon)
        </button>
      </div>

      {/* Provider filters placeholder */}
      <div className="flex gap-3 mb-6">
        {["All", "Therapists", "Psychiatry", "Inactive"].map((filter, idx) => (
          <button
            key={filter}
            disabled
            className={`px-4 py-2 text-xs font-semibold rounded-full opacity-60 cursor-not-allowed ${
              idx === 0
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Provider list placeholder */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["Provider", "Specialty", "License #", "Status", "Actions"].map((col) => (
                <th key={col} className="text-left px-6 py-4 text-gray-600 font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                <p className="text-4xl mb-3">🩺</p>
                <p className="text-sm">No providers added yet.</p>
                <p className="text-xs mt-1">
                  {/* TODO (Phase 3): Fetch from Provider model */}
                  Provider records will appear here once they are added.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-100">
        <p className="text-amber-800 text-sm font-medium">
          📋 Phase 0 — Placeholder. Provider management coming in future phases.
        </p>
      </div>
    </div>
  );
}
