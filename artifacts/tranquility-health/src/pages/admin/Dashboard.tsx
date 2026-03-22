/**
 * AdminDashboard — /admin/dashboard
 * Shows live request counts by status and a recent-requests list.
 * TODO (Phase 3): Add admin role guard.
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import {
  getRequestCounts,
  listRequests,
  REQUEST_STATUS_LABELS,
  SERVICE_LABELS,
  type AppointmentRequest,
  type RequestStatus,
} from "@/lib/admin-api";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ROUTES } from "@/lib/config/routes";

const STATUS_CARD_CONFIG: {
  status: RequestStatus;
  label: string;
  color: string;
  textColor: string;
}[] = [
  { status: "new", label: "New", color: "bg-blue-50 border-blue-200", textColor: "text-blue-700" },
  { status: "under_review", label: "Under Review", color: "bg-amber-50 border-amber-200", textColor: "text-amber-700" },
  { status: "approved", label: "Approved", color: "bg-green-50 border-green-200", textColor: "text-green-700" },
  { status: "rejected", label: "Rejected", color: "bg-red-50 border-red-200", textColor: "text-red-700" },
  { status: "invited", label: "Invited", color: "bg-purple-50 border-purple-200", textColor: "text-purple-700" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [c, page] = await Promise.all([getRequestCounts(), listRequests(undefined, 1, 10)]);
        setCounts(c);
        setRecent(page.requests);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalRequests = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-500">Operational overview for Tranquility Health.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={ROUTES.admin.requests}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            View Requests
          </Link>
          <Link
            href={ROUTES.admin.providers}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Manage Provider
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Status count cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
        {STATUS_CARD_CONFIG.map(({ status, label, color, textColor }) => (
          <Link
            key={status}
            href={`${ROUTES.admin.requests}?status=${status}`}
            className={`p-5 rounded-xl border ${color} hover:shadow-md transition-shadow block`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wider ${textColor}`}>
              {label}
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {loading ? "—" : (counts[status] ?? 0)}
            </p>
          </Link>
        ))}
      </div>

      {/* Total summary */}
      <div className="mb-8 p-4 bg-gray-100 rounded-xl border border-gray-200 text-sm text-gray-600">
        Total requests: <span className="font-bold text-gray-900">{loading ? "—" : totalRequests}</span>
      </div>

      {/* Recent requests */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Requests</h2>
          <Link href={ROUTES.admin.requests} className="text-sm text-teal-600 hover:text-teal-800 font-medium">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No requests yet. Once patients submit the intake form, they will appear here.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Name", "Service", "Preferred Time", "Submitted", "Status"].map((col) => (
                  <th key={col} className="text-left px-6 py-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{r.fullName}</td>
                  <td className="px-6 py-3 text-gray-600">
                    {SERVICE_LABELS[r.serviceInterest] ?? r.serviceInterest}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{r.preferredTime}</td>
                  <td className="px-6 py-3 text-gray-500">{formatDate(r.createdAt)}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
