import Link from "next/link";
import { formatDate } from "@/lib/ui";
import { CATEGORY_LABELS } from "@/lib/categories";
import { StatusBadge, SeverityBadge } from "./StatusBadge";
import { SLAIndicator } from "./SLAIndicator";
import { MapPin } from "lucide-react";

type Props = { complaint: any; photoUrl?: string; authorityName?: string };

export function ComplaintCard({ complaint, photoUrl, authorityName }: Props) {
  return (
    <Link
      href={"/complaints/" + complaint.id}
      className="group glass rounded-2xl flex gap-4 p-4 hover:border-teal-500/40 hover:shadow-[0_0_24px_rgba(20,184,166,0.1)] transition-all duration-200"
    >
      {/* Photo */}
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          className="h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
        />
      ) : (
        <div className="h-20 w-20 shrink-0 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-600 text-xl">
          📷
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-slate-600">{complaint.public_id}</span>
          <StatusBadge status={complaint.status} />
        </div>

        {/* Title */}
        <p className="font-semibold text-slate-100 group-hover:text-teal-400 transition-colors duration-200">
          {CATEGORY_LABELS[complaint.category] ?? complaint.category}
        </p>

        {/* Location */}
        <p className="flex items-center gap-1 truncate text-xs text-slate-500">
          <MapPin className="h-3 w-3 shrink-0 text-slate-600" />
          {complaint.wards?.name ?? "Area not assigned"} · {authorityName ?? "Not routed yet"}
        </p>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={complaint.severity} />
          <SLAIndicator dueAt={complaint.sla_due_at} />
        </div>

        {/* Timestamps */}
        <p className="text-xs text-slate-600">
          Created {formatDate(complaint.created_at)} · Updated {formatDate(complaint.updated_at)}
        </p>
      </div>
    </Link>
  );
}
