import { useOpenStatus, useTodayHours } from "@/hooks/useOpenStatus";

export function OpenStatusBadge() {
  const open = useOpenStatus();
  const todayHours = useTodayHours();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {open ? (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Open now
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          Closed
        </span>
      )}
      <span className="text-xs text-slate-500">
        Today: <span className="font-medium text-slate-700">{todayHours}</span>
      </span>
    </div>
  );
}
