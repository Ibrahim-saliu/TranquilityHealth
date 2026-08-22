/**
 * AdminDashboard — /admin/dashboard
 * Summary-first overview: request counts by status and a recent-requests list.
 */

import { useEffect, useState } from "react";
import { Link, Redirect } from "wouter";
import {
  getRequestCounts,
  listRequests,
  SERVICE_LABELS,
  formatPreferredTime,
  type AppointmentRequest,
  type RequestStatus,
} from "@/lib/admin-api";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ROUTES } from "@/lib/config/routes";
import { useAuth } from "@/lib/auth/context";

const STATUS_TILES: { status: RequestStatus; label: string; dot: string; attention?: boolean }[] = [
  { status: "new", label: "New", dot: "bg-teal-600", attention: true },
  { status: "under_review", label: "Under review", dot: "bg-amber-600" },
  { status: "approved", label: "Approved", dot: "bg-emerald-600" },
  { status: "rejected", label: "Rejected", dot: "bg-red-600" },
  { status: "invited", label: "Invited", dot: "bg-slate-400" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [recent, setRecent] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [c, page] = await Promise.all([getRequestCounts(), listRequests(undefined, 1, 8)]);
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

  if (user?.role === "provider") {
    return <Redirect to="/admin/provider-dashboard" />;
  }

  const awaiting = (counts["new"] ?? 0) + (counts["under_review"] ?? 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            {loading
              ? "Loading clinic activity…"
              : awaiting > 0
                ? `${awaiting} request${awaiting === 1 ? "" : "s"} awaiting review`
                : "You're all caught up on requests."}
          </p>
        </div>
        <Link
          href={ROUTES.admin.requests}
          className="px-4 py-2 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 transition-colors shadow-sm"
        >
          Review requests
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {/* Status tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {STATUS_TILES.map(({ status, label, dot, attention }) => (
          <Link
            key={status}
            href={`${ROUTES.admin.requests}?status=${status}`}
            className={`p-4 rounded-xl border transition-shadow hover:shadow-sm block ${
              attention ? "bg-teal-50 border-teal-100" : "bg-white border-slate-200"
            }`}
          >
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              {label}
            </p>
            <p className="text-3xl font-bold mt-2 text-slate-900 tabular-nums">
              {loading ? "—" : (counts[status] ?? 0)}
            </p>
          </Link>
        ))}
      </div>

      {/* Recent requests */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recent requests</h2>
          <Link href={ROUTES.admin.requests} className="text-xs text-teal-700 hover:text-teal-800 font-medium">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm font-medium text-slate-500">No requests yet</p>
            <p className="text-xs text-slate-400 mt-1">Once patients submit the intake form, they'll appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Name", "Service", "Preferred time", "Submitted", "Status"].map((col) => (
                    <th
                      key={col}
                      className="text-left px-5 py-2.5 text-slate-400 font-semibold text-[11px] uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recent.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3 font-medium text-slate-900">{r.fullName}</td>
                    <td className="px-5 py-3 text-slate-600">{SERVICE_LABELS[r.serviceInterest] ?? r.serviceInterest}</td>
                    <td className="px-5 py-3 text-slate-600">{formatPreferredTime(r.preferredTime)}</td>
                    <td className="px-5 py-3 text-slate-500 tabular-nums">{formatDate(r.createdAt)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
