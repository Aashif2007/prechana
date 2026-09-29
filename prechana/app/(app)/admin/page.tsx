import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORY_LABELS } from "@/lib/categories";
import { card, btn, btnLight } from "@/lib/ui";
import { StatCard, BarList } from "@/components/StatCard";
import { ComplaintMap } from "@/components/ComplaintMap";
import { ComplaintList } from "@/components/ComplaintList";
import { routePending, runCheckNow, advanceDemoClock } from "./actions";

export default async function AdminPage() {
  await requireRole(["admin"]);
  const db = createAdminClient();

  const { data } = await db
    .from("complaints")
    .select("*, wards(name)")
    .order("created_at", { ascending: false });
  const complaints = data ?? [];

  const { data: confirmed } = await db
    .from("complaint_resolution")
    .select("confirmed_at, complaints(created_at)")
    .eq("citizen_confirmed", true);

  let open = 0;
  let resolved = 0;
  let overdue = 0;
  let escalated = 0;
  const byCategory: Record<string, number> = {};
  const byWard: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  for (const c of complaints) {
    if (c.status === "Resolved") resolved++;
    else open++;
    if (c.status === "Overdue") overdue++;
    if (c.status === "Escalated") escalated++;

    const categoryName = CATEGORY_LABELS[c.category] ?? c.category;
    byCategory[categoryName] = (byCategory[categoryName] ?? 0) + 1;
    const wardName = c.wards?.name ?? "Unrouted";
    byWard[wardName] = (byWard[wardName] ?? 0) + 1;
    byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
  }

  let totalHours = 0;
  let counted = 0;
  for (const row of confirmed ?? []) {
    const created = (row.complaints as any)?.created_at;
    if (created && row.confirmed_at) {
      totalHours += (new Date(row.confirmed_at).getTime() - new Date(created).getTime()) / 3600000;
      counted++;
    }
  }
  const avgHours = counted > 0 ? (totalHours / counted).toFixed(1) + " h" : "-";

  const points = complaints.map((c) => ({
    lat: c.latitude,
    lng: c.longitude,
    label: c.public_id + " · " + c.status,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total" value={complaints.length} />
        <StatCard label="Open" value={open} />
        <StatCard label="Resolved" value={resolved} />
        <StatCard label="Overdue" value={overdue} />
        <StatCard label="Escalated" value={escalated} />
        <StatCard label="Avg resolution" value={avgHours} />
      </div>

      <div className={card + " space-y-3"}>
        <p className="font-semibold">Demo controls</p>
        <p className="text-xs text-slate-500">
          Demo SLA values are tiny on purpose. "Advance demo clock" moves the next deadline into the past and
          runs the real escalation engine: click once for a reminder, again for an escalation.
        </p>
        <div className="flex flex-wrap gap-2">
          <form action={routePending}><button className={btn}>1. Route new complaints</button></form>
          <form action={advanceDemoClock}><button className={btn}>2. Advance demo clock</button></form>
          <form action={runCheckNow}><button className={btnLight}>Run escalation check</button></form>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <BarList title="Complaints by category" counts={byCategory} />
        <BarList title="Complaints by area" counts={byWard} />
        <BarList title="Resolution status" counts={byStatus} />
      </div>

      <div className={card}>
        <p className="mb-3 font-semibold">Complaint locations</p>
        <ComplaintMap points={points} />
      </div>

      <div>
        <h2 className="mb-3 font-semibold">All complaints</h2>
        <ComplaintList complaints={complaints} />
      </div>
    </div>
  );
}
