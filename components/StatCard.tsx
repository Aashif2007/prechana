import { card } from "@/lib/ui";

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={card}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
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
    <div className={card}>
      <p className="mb-3 text-sm font-semibold">{title}</p>
      {labels.length === 0 && <p className="text-sm text-slate-400">No data yet</p>}
      <div className="space-y-2">
        {labels.map((label) => (
          <div key={label}>
            <div className="flex justify-between text-xs text-slate-600">
              <span>{label}</span>
              <span>{counts[label]}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: (counts[label] / max) * 100 + "%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
