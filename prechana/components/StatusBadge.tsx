const STATUS_STYLES: Record<string, string> = {
  Submitted: "bg-slate-100 text-slate-700",
  Acknowledged: "bg-sky-100 text-sky-800",
  Assigned: "bg-blue-100 text-blue-800",
  "In Progress": "bg-indigo-100 text-indigo-800",
  "Awaiting Action": "bg-amber-100 text-amber-800",
  Overdue: "bg-red-100 text-red-700",
  Escalated: "bg-orange-100 text-orange-800",
  "Pending Confirmation": "bg-purple-100 text-purple-800",
  Resolved: "bg-emerald-100 text-emerald-800",
  Reopened: "bg-rose-100 text-rose-800",
};

const SEVERITY_STYLES: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700";
  return <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium " + style}>{status}</span>;
}

export function SeverityBadge({ severity }: { severity: string }) {
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.medium;
  return <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium capitalize " + style}>{severity}</span>;
}
