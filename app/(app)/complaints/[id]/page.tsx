import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPhotoUrls, getAuthorityNames } from "@/lib/lookup";
import { CATEGORY_LABELS } from "@/lib/categories";
import { card, btn, formatDate } from "@/lib/ui";
import { StatusBadge, SeverityBadge } from "@/components/StatusBadge";
import { SLAIndicator } from "@/components/SLAIndicator";
import { ComplaintTimeline } from "@/components/ComplaintTimeline";
import { ComplaintMap } from "@/components/ComplaintMap";
import { confirmResolution } from "@/app/(app)/workflow/actions";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

export default async function ComplaintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;

  const profile = await getCurrentProfile();
  const supabase = await createClient();

  // RLS decides whether this user may see the complaint at all
  const { data: complaint } = await supabase
    .from("complaints").select("*, wards(name)").eq("id", id).single();
  if (!complaint || !profile) notFound();

  const { data: events } = await supabase
    .from("complaint_status_history").select("*").eq("complaint_id", id).order("created_at");
  const { data: escalations } = await supabase
    .from("complaint_escalations").select("*").eq("complaint_id", id).order("created_at");
  const { data: resolutions } = await supabase
    .from("complaint_resolution").select("*").eq("complaint_id", id)
    .order("created_at", { ascending: false }).limit(1);
  const resolution = resolutions?.[0];

  const photos = await getPhotoUrls([id]);
  const nameIds = [complaint.current_authority_id];
  for (const e of escalations ?? []) {
    nameIds.push(e.from_authority_id);
    nameIds.push(e.to_authority_id);
  }
  const names = await getAuthorityNames(nameIds);

  const isOwner = profile.id === complaint.citizen_id;

  return (
    <div className="space-y-6">
      {created && (
        <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
          <p className="font-semibold text-emerald-800">Complaint Created Successfully</p>
          <p className="font-mono text-sm">{complaint.public_id}</p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          {photos[id] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photos[id]} alt="Complaint" className="max-h-80 w-full rounded-2xl object-cover" />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400">No photo</div>
          )}
          <ComplaintMap points={[{ lat: complaint.latitude, lng: complaint.longitude, label: complaint.public_id }]} />
        </div>

        <div className={card}>
          <dl>
            <Row label="Complaint ID"><span className="font-mono">{complaint.public_id}</span></Row>
            <Row label="Category">{CATEGORY_LABELS[complaint.category] ?? complaint.category}</Row>
            <Row label="Severity"><SeverityBadge severity={complaint.severity} /></Row>
            <Row label="Status"><StatusBadge status={complaint.status} /></Row>
            <Row label="Area">{complaint.wards?.name ?? "Not assigned"}</Row>
            <Row label="Location">
              {complaint.address ? complaint.address + " · " : ""}
              {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}
            </Row>
            <Row label="Current authority">
              {complaint.current_authority_id ? names[complaint.current_authority_id] : "Not routed yet"}
              {complaint.current_level > 0 ? " (level " + complaint.current_level + ")" : ""}
            </Row>
            <Row label="SLA"><SLAIndicator dueAt={complaint.sla_due_at} /></Row>
            <Row label="Created">{formatDate(complaint.created_at)}</Row>
            <Row label="Last updated">{formatDate(complaint.updated_at)}</Row>
          </dl>
          <p className="mt-3 text-sm text-slate-600">{complaint.description}</p>
          <p className="mt-3 text-xs text-slate-400">
            Demo Routing: nothing is sent to a real government authority.
          </p>
        </div>
      </div>

      {isOwner && complaint.status === "Pending Confirmation" && (
        <div className="rounded-2xl bg-purple-50 p-4 ring-1 ring-purple-200">
          <p className="font-semibold">This complaint has been marked as resolved. Is the problem actually fixed?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={confirmResolution}>
              <input type="hidden" name="complaintId" value={id} />
              <input type="hidden" name="solved" value="yes" />
              <button className={btn}>YES — Problem Solved</button>
            </form>
            <form action={confirmResolution}>
              <input type="hidden" name="complaintId" value={id} />
              <input type="hidden" name="solved" value="no" />
              <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                NO — Still a Problem
              </button>
            </form>
          </div>
        </div>
      )}

      {isOwner && complaint.status === "Resolved" && (
        <form action={confirmResolution}>
          <input type="hidden" name="complaintId" value={id} />
          <input type="hidden" name="solved" value="no" />
          <button className="rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
            Report Still Unresolved
          </button>
        </form>
      )}

      <section className={card}>
        <h2 className="mb-4 font-semibold">Complaint Timeline</h2>
        <ComplaintTimeline events={events ?? []} />
      </section>

      <section className={card}>
        <h2 className="mb-3 font-semibold">Escalation History</h2>
        {(escalations ?? []).length === 0 && <p className="text-sm text-slate-400">No escalations.</p>}
        {(escalations ?? []).map((e) => (
          <p key={e.id} className="border-b border-slate-100 py-2 text-sm last:border-0">
            {formatDate(e.created_at)}: level {e.from_level} ({e.from_authority_id ? names[e.from_authority_id] : "-"}) →
            level {e.to_level} ({names[e.to_authority_id]}). Reason: {e.reason}
          </p>
        ))}
      </section>

      {resolution && (
        <section className={card}>
          <h2 className="mb-2 font-semibold">Resolution</h2>
          <p className="text-sm">{resolution.description}</p>
          <p className="mt-1 text-xs text-slate-500">
            Completed on {resolution.completed_on} ·{" "}
            {resolution.citizen_confirmed === null
              ? "Waiting for citizen confirmation"
              : resolution.citizen_confirmed
                ? "Citizen confirmed"
                : "Citizen said it is still a problem"}
          </p>
        </section>
      )}
    </div>
  );
}
