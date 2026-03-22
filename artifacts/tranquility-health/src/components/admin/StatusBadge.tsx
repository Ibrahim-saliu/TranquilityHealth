import { REQUEST_STATUS_COLORS, REQUEST_STATUS_LABELS, type RequestStatus } from "@/lib/admin-api";

interface StatusBadgeProps {
  status: RequestStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = REQUEST_STATUS_LABELS[status] ?? status;
  const color = REQUEST_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}
