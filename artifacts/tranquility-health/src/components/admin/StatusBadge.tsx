import { type RequestStatus } from "@/lib/admin-api";

interface StatusBadgeProps {
  status: RequestStatus;
}

const STATUS_STYLES: Record<RequestStatus, string> = {
  new: "bg-teal-50 text-teal-700 border border-teal-200",
  under_review: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-700 border border-red-200",
  invited: "bg-violet-50 text-violet-700 border border-violet-200",
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  new: "New",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  invited: "Invited",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] ?? status;
  const style = STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700 border border-slate-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}
