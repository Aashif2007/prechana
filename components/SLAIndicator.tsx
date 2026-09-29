import { Clock, AlertTriangle } from "lucide-react";

export function SLAIndicator({ dueAt }: { dueAt: string | null }) {
  if (!dueAt) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
        <Clock className="h-3 w-3" /> No SLA
      </span>
    );
  }

  const minutes = Math.round((new Date(dueAt).getTime() - Date.now()) / 60000);

  if (minutes < 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400">
        <AlertTriangle className="h-3 w-3" />
        Overdue by {Math.abs(minutes)} min
      </span>
    );
  }

  if (minutes < 120) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
        <Clock className="h-3 w-3" />
        Due in {minutes} min
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <Clock className="h-3 w-3" />
      Due in {Math.round(minutes / 60)} h
    </span>
  );
}
