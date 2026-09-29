export function SLAIndicator({ dueAt }: { dueAt: string | null }) {
  if (!dueAt) return <span className="text-xs text-slate-400">No SLA timer</span>;

  const minutes = Math.round((new Date(dueAt).getTime() - Date.now()) / 60000);
  if (minutes < 0) {
    return <span className="text-xs font-medium text-red-600">Overdue by {Math.abs(minutes)} min</span>;
  }
  if (minutes < 120) {
    return <span className="text-xs font-medium text-amber-700">Due in {minutes} min</span>;
  }
  return <span className="text-xs text-slate-500">Due in {Math.round(minutes / 60)} h</span>;
}
