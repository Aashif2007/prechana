import Link from "next/link";
import { card, formatDate } from "@/lib/ui";
import { CATEGORY_LABELS } from "@/lib/categories";
import { StatusBadge, SeverityBadge } from "./StatusBadge";
import { SLAIndicator } from "./SLAIndicator";

type Props = { complaint: any; photoUrl?: string; authorityName?: string };

export function ComplaintCard({ complaint, photoUrl, authorityName }: Props) {
  return (
    <Link href={"/complaints/" + complaint.id} className={card + " flex gap-3 hover:ring-emerald-300"}>
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="h-20 w-20 shrink-0 rounded-xl bg-slate-100" />
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-slate-500">{complaint.public_id}</span>
          <StatusBadge status={complaint.status} />
        </div>
        <p className="font-medium">{CATEGORY_LABELS[complaint.category] ?? complaint.category}</p>
        <p className="truncate text-sm text-slate-500">
          {complaint.wards?.name ?? "Area not assigned"} · {authorityName ?? "Not routed yet"}
        </p>
        <div className="flex items-center gap-3">
          <SeverityBadge severity={complaint.severity} />
          <SLAIndicator dueAt={complaint.sla_due_at} />
        </div>
        <p className="text-xs text-slate-400">
          Created {formatDate(complaint.created_at)} · Updated {formatDate(complaint.updated_at)}
        </p>
      </div>
    </Link>
  );
}
