const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Submitted:             { bg: "bg-slate-500/10",   text: "text-slate-400",   dot: "bg-slate-400" },
  Acknowledged:          { bg: "bg-sky-500/10",     text: "text-sky-400",     dot: "bg-sky-400" },
  Assigned:              { bg: "bg-blue-500/10",    text: "text-blue-400",    dot: "bg-blue-400" },
  "In Progress":         { bg: "bg-indigo-500/10",  text: "text-indigo-400",  dot: "bg-indigo-400" },
  "Awaiting Action":     { bg: "bg-amber-500/10",   text: "text-amber-400",   dot: "bg-amber-400" },
  Overdue:               { bg: "bg-red-500/10",     text: "text-red-400",     dot: "bg-red-400" },
  Escalated:             { bg: "bg-orange-500/10",  text: "text-orange-400",  dot: "bg-orange-400" },
  "Pending Confirmation":{ bg: "bg-violet-500/10",  text: "text-violet-400",  dot: "bg-violet-400" },
  Resolved:              { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  Reopened:              { bg: "bg-rose-500/10",    text: "text-rose-400",    dot: "bg-rose-400" },
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  low:    { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-400" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  high:   { bg: "bg-red-500/10",   text: "text-red-400",   dot: "bg-red-400" },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Submitted;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/5 px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}
    >
      <span className={`status-dot ${style.dot}`} />
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.medium;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/5 px-2.5 py-0.5 text-xs font-semibold capitalize ${style.bg} ${style.text}`}
    >
      <span className={`status-dot ${style.dot}`} />
      {severity}
    </span>
  );
}
