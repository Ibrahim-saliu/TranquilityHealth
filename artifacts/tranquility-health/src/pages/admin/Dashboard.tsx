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
  gradient: string;
  numColor: string;
  border: string;
}[] = [
  {
    status: "new",
    label: "New",
    gradient: "from-teal-50 to-cyan-50",
    numColor: "text-teal-700",
    border: "border-teal-200",
  },
  {
    status: "under_review",
    label: "Under Review",
    gradient: "from-amber-50 to-yellow-50",
    numColor: "text-amber-700",
    border: "border-amber-200",
  },
  {
    status: "approved",
    label: "Approved",
    gradient: "from-emerald-50 to-green-50",
    numColor: "text-emerald-700",
    border: "border-emerald-200",
  },
  {
    status: "rejected",
    label: "Rejected",
    gradient: "from-red-50 to-rose-50",
    numColor: "text-red-700",
    border: "border-red-200",
  },
  {
    status: "invited",
    label: "Invited",
    gradient: "from-violet-50 to-indigo-50",
    numColor: "text-violet-700",
    border: "border-violet-200",
  },
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
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-slate-500">Operational overview for Tranquility Health.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={ROUTES.admin.requests}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-teal-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            View Requests
          </Link>
          <Link
            href={ROUTES.admin.providers}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-colors"
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
        {STATUS_CARD_CONFIG.map(({ status, label, gradient, numColor, border }) => (
          <Link
            key={status}
            href={`${ROUTES.admin.requests}?status=${status}`}
            className={`p-5 rounded-xl border ${border} bg-gradient-to-br ${gradient} hover:shadow-md transition-shadow block`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {label}
            </p>
            <p className={`text-3xl font-bold mt-2 ${numColor}`}>
              {loading ? "—" : (counts[status] ?? 0)}
            </p>
          </Link>
        ))}
      </div>

      {/* Total summary */}
      <div className="mb-8 p-4 bg-teal-50 rounded-xl border border-teal-100 text-sm text-slate-600">
        Total requests:{" "}
        <span className="font-bold text-slate-900">{loading ? "—" : totalRequests}</span>
      </div>

      {/* Recent requests */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <h2 className="text-base font-semibold text-slate-900">Recent Requests</h2>
          <Link href={ROUTES.admin.requests} className="text-sm text-teal-600 hover:text-teal-800 font-medium">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400 text-sm">
            No requests yet. Once patients submit the intake form, they will appear here.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Name", "Service", "Preferred Time", "Submitted", "Status"].map((col) => (
                  <th key={col} className="text-left px-6 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recent.map((r) => (
                <tr key={r.id} className="hover:bg-teal-50/40 transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-900">{r.fullName}</td>
                  <td className="px-6 py-3 text-slate-600">
                    {SERVICE_LABELS[r.serviceInterest] ?? r.serviceInterest}
                  </td>
                  <td className="px-6 py-3 text-slate-600">{r.preferredTime}</td>
                  <td className="px-6 py-3 text-slate-500">{formatDate(r.createdAt)}</td>
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
