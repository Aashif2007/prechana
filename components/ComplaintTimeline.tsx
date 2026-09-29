import { formatDate } from "@/lib/ui";

const ICONS: Record<string, string> = {
  submitted:              "🟢",
  ai:                     "🤖",
  category_corrected:     "✏️",
  routed:                 "📍",
  routing_failed:         "⚠️",
  sla_started:            "⏱️",
  sla_missing:            "⚠️",
  acknowledged:           "👤",
  forwarded:              "🏢",
  note:                   "📝",
  reminder:               "🔔",
  escalated:              "🔼",
  overdue:                "⏰",
  work_started:           "🔧",
  completed:              "✅",
  confirmation_requested: "❓",
  resolved:               "🎉",
  reopened:               "♻️",
};

const EVENT_COLORS: Record<string, string> = {
  resolved:   "border-emerald-500/40 bg-emerald-500/10",
  escalated:  "border-orange-500/40 bg-orange-500/10",
  overdue:    "border-red-500/40 bg-red-500/10",
  reopened:   "border-rose-500/40 bg-rose-500/10",
  reminder:   "border-amber-500/40 bg-amber-500/10",
};

type TimelineEvent = { id: string; event_type: string; message: string; created_at: string };

export function ComplaintTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="relative ml-3 space-y-6 border-l border-teal-500/20 pl-7">
      {events.map((event, i) => {
        const ringColor = EVENT_COLORS[event.event_type] ?? "border-white/10 bg-white/5";
        const isFirst = i === 0;
        return (
          <li key={event.id} className="relative animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
            {/* Dot */}
            <span
              className={`absolute -left-[42px] flex h-9 w-9 items-center justify-center rounded-full text-base border ${ringColor} backdrop-blur-sm`}
            >
              {ICONS[event.event_type] ?? "•"}
            </span>

            {/* Content */}
            <div className={`glass rounded-xl p-3 ${isFirst ? "border-teal-500/30" : ""}`}>
              <p className="text-[11px] font-medium text-slate-600 mb-0.5 uppercase tracking-wide">
                {formatDate(event.created_at)}
              </p>
              <p className="text-sm text-slate-300 leading-snug">{event.message}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
