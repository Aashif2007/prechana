import { formatDate } from "@/lib/ui";

const ICONS: Record<string, string> = {
  submitted: "🟢", ai: "🤖", category_corrected: "✏️", routed: "📍",
  routing_failed: "⚠️", sla_started: "⏱️", sla_missing: "⚠️", acknowledged: "👤",
  forwarded: "🏢", note: "📝", reminder: "🔔", escalated: "🔼", overdue: "⏰",
  work_started: "🔧", completed: "✅", confirmation_requested: "❓",
  resolved: "🎉", reopened: "♻️",
};

type TimelineEvent = { id: string; event_type: string; message: string; created_at: string };

export function ComplaintTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative ml-3 space-y-5 border-l-2 border-emerald-200 pl-6">
      {events.map((event) => (
        <li key={event.id} className="relative">
          <span className="absolute -left-[38px] flex h-8 w-8 items-center justify-center rounded-full bg-white text-base ring-2 ring-emerald-200">
            {ICONS[event.event_type] ?? "•"}
          </span>
          <p className="text-xs text-slate-400">{formatDate(event.created_at)}</p>
          <p className="text-sm text-slate-800">{event.message}</p>
        </li>
      ))}
    </ol>
  );
}
