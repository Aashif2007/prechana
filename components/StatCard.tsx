/* ─── StatCard & BarList ─────────────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  accent?: string; // e.g. "teal" | "sky" | "violet" | "amber" | "rose"
}

const ACCENT_MAP: Record<string, { text: string; bg: string; border: string }> = {
  teal:   { text: "text-teal-400",   bg: "bg-teal-500/10",   border: "border-teal-500/20" },
  sky:    { text: "text-sky-400",    bg: "bg-sky-500/10",    border: "border-sky-500/20" },
  violet: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  amber:  { text: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
  rose:   { text: "text-rose-400",   bg: "bg-rose-500/10",   border: "border-rose-500/20" },
  green:  { text: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20" },
};

export function StatCard({ label, value, accent = "teal" }: StatCardProps) {
  const colors = ACCENT_MAP[accent] ?? ACCENT_MAP.teal;
  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-2 hover:border-teal-500/30 hover:shadow-[0_0_20px_rgba(20,184,166,0.08)] transition-all duration-200">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-extrabold tracking-tight ${colors.text}`}>{value}</p>
    </div>
  );
}

export function BarList({ title, counts }: { title: string; counts: Record<string, number> }) {
  const labels = Object.keys(counts);
  let max = 1;
  for (const label of labels) {
    if (counts[label] > max) max = counts[label];
  }

  return (
    <div className="glass rounded-2xl p-5">
      <p className="mb-4 text-sm font-semibold text-slate-200">{title}</p>
      {labels.length === 0 && (
        <p className="text-sm text-slate-600">No data yet.</p>
      )}
      <div className="space-y-3">
        {labels.map((label) => (
          <div key={label}>
            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>{label}</span>
              <span className="font-semibold text-slate-300">{counts[label]}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 transition-all duration-500"
                style={{ width: (counts[label] / max) * 100 + "%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
