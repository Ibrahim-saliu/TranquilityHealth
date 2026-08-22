/**
 * AdminRequests — /admin/requests
 * Filterable, paginated table of appointment requests with an inline detail panel.
 */

import { useEffect, useState, useCallback } from "react";
import { useSearch, Redirect } from "wouter";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  listRequests,
  updateRequestStatus,
  REQUEST_STATUS_LABELS,
  SERVICE_LABELS,
  formatPreferredTime,
  type AppointmentRequest,
  type RequestStatus,
  type RequestsPage,
} from "@/lib/admin-api";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useAuth } from "@/lib/auth/context";

const ALL_STATUSES: RequestStatus[] = ["new", "under_review", "approved", "rejected", "invited"];
const PAGE_SIZE = 20;

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
    timeZoneName: "short",
  });
}

// ---------------------------------------------------------------------------
// Detail Panel
// ---------------------------------------------------------------------------
interface DetailPanelProps {
  request: AppointmentRequest;
  onClose: () => void;
  onStatusUpdated: (id: string, status: RequestStatus) => void;
}

function DetailPanel({ request, onClose, onStatusUpdated }: DetailPanelProps) {
  const [updating, setUpdating] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function handleStatusChange(newStatus: RequestStatus) {
    if (newStatus === request.status) return;
    setUpdating(true);
    setFeedback(null);
    try {
      await updateRequestStatus(request.id, newStatus);
      onStatusUpdated(request.id, newStatus);
      setFeedback({ type: "success", msg: `Status updated to "${REQUEST_STATUS_LABELS[newStatus]}"` });
    } catch (err) {
      setFeedback({ type: "error", msg: err instanceof Error ? err.message : "Failed to update status" });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/40">
        <h2 className="text-base font-semibold text-slate-900">Request Detail</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-slate-100">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Status */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Current Status</p>
          <StatusBadge status={request.status} />
        </div>

        {/* Contact info */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Contact</p>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-32 text-slate-400 shrink-0">Name</dt>
              <dd className="font-medium text-slate-900">{request.fullName}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 text-slate-400 shrink-0">Email</dt>
              <dd className="text-slate-700 break-all">{request.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 text-slate-400 shrink-0">Phone</dt>
              <dd className="text-slate-700">{request.phone}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 text-slate-400 shrink-0">Preferred contact</dt>
              <dd className="text-slate-700 capitalize">{request.preferredContactMethod ?? "—"}</dd>
            </div>
          </dl>
        </div>

        {/* Request info */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Request</p>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-32 text-slate-400 shrink-0">Service</dt>
              <dd className="text-slate-700">{SERVICE_LABELS[request.serviceInterest] ?? request.serviceInterest}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 text-slate-400 shrink-0">Preferred time</dt>
              <dd className="text-slate-700">{formatPreferredTime(request.preferredTime)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 text-slate-400 shrink-0">New patient?</dt>
              <dd className="text-slate-700">{request.isNewPatient == null ? "—" : request.isNewPatient ? "Yes" : "No"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 text-slate-400 shrink-0">Submitted</dt>
              <dd className="text-slate-700">{formatDateTime(request.createdAt)}</dd>
            </div>
            {request.reviewedAt && (
              <div className="flex gap-2">
                <dt className="w-32 text-slate-400 shrink-0">Last reviewed</dt>
                <dd className="text-slate-700">{formatDateTime(request.reviewedAt)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Status update footer */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Update Status</p>
        {feedback && (
          <p className={`text-xs mb-2 font-medium ${feedback.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
            {feedback.msg}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={updating || s === request.status}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                ${s === request.status
                  ? "bg-teal-100 text-teal-700 border-teal-200 cursor-default"
                  : "bg-white border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50 disabled:opacity-50"
                }`}
            >
              {REQUEST_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination controls
// ---------------------------------------------------------------------------
interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}

function Pagination({ page, totalPages, total, pageSize, onPage }: PaginationProps) {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
      <span>{total === 0 ? "No requests" : `${start}–${end} of ${total} request${total !== 1 ? "s" : ""}`}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-2 font-medium text-slate-700">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="p-1 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function AdminRequestsPage() {
  const search = useSearch();
  const { user } = useAuth();
  const initialStatus = new URLSearchParams(search).get("status") as RequestStatus | null;

  const [pageData, setPageData] = useState<RequestsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">(
    initialStatus && ALL_STATUSES.includes(initialStatus) ? initialStatus : "all",
  );
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const requests = pageData?.requests ?? [];
  const selectedRequest = requests.find((r) => r.id === selectedId) ?? null;

  const loadRequests = useCallback(async (filter: RequestStatus | "all", pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listRequests(filter === "all" ? undefined : filter, pageNum, PAGE_SIZE);
      setPageData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setSelectedId(null);
  }, [statusFilter]);

  useEffect(() => {
    loadRequests(statusFilter, page);
  }, [statusFilter, page, loadRequests]);

  if (user && user.role === "provider") {
    return <Redirect to="/admin/provider-dashboard" />;
  }

  function handleStatusUpdated(id: string, newStatus: RequestStatus) {
    setPageData((prev) =>
      prev
        ? { ...prev, requests: prev.requests.map((r) => (r.id === id ? { ...r, status: newStatus } : r)) }
        : prev,
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appointment Requests</h1>
          <p className="mt-1 text-slate-500">Review and manage incoming patient requests.</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(["all", ...ALL_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border
              ${statusFilter === s
                ? "bg-gradient-to-r from-teal-600 to-indigo-600 text-white border-transparent shadow-sm"
                : "bg-white text-slate-600 border-slate-300 hover:border-teal-400 hover:text-teal-700"
              }`}
          >
            {s === "all" ? "All" : REQUEST_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Requests table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["Name", "Email", "Service", "Preferred Time", "Submitted", "Status"].map((col) => (
                <th key={col} className="text-left px-5 py-3 text-slate-500 font-semibold text-xs uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">
                  Loading…
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center text-slate-400 text-sm">
                  No requests found.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}
                  className={`cursor-pointer transition-colors hover:bg-teal-50/50 ${
                    r.id === selectedId ? "bg-teal-50/70" : ""
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-slate-900">{r.fullName}</td>
                  <td className="px-5 py-3 text-slate-600">{r.email}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {SERVICE_LABELS[r.serviceInterest] ?? r.serviceInterest}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{formatPreferredTime(r.preferredTime)}</td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageData && (
        <Pagination
          page={pageData.page}
          totalPages={pageData.totalPages}
          total={pageData.total}
          pageSize={pageData.pageSize}
          onPage={setPage}
        />
      )}

      {/* Detail panel */}
      {selectedRequest && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
            onClick={() => setSelectedId(null)}
          />
          <DetailPanel
            request={selectedRequest}
            onClose={() => setSelectedId(null)}
            onStatusUpdated={handleStatusUpdated}
          />
        </>
      )}
    </div>
  );
}
