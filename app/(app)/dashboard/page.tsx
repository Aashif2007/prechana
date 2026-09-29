import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/StatCard";
import { ComplaintList } from "@/components/ComplaintList";
import { btn } from "@/lib/ui";

export default async function DashboardPage() {
  const profile = await requireRole(["citizen"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("complaints")
    .select("*, wards(name)")
    .order("created_at", { ascending: false });
  const complaints = data ?? [];

  let open = 0;
  let inProgress = 0;
  let resolved = 0;
  let escalated = 0;
  for (const c of complaints) {
    if (c.status === "Resolved") resolved++;
    else open++;
    if (c.status === "In Progress") inProgress++;
    if (c.status === "Escalated") escalated++;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Hello, {profile.full_name}</h1>
        <Link href="/report" className={btn}>Report a Problem</Link>
      </div>

      {!profile.aadhaar_verified && (
        <Link
          href="/profile"
          className="block rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100"
        >
          Verify your identity with Aadhaar to build trust with authorities reviewing your complaints. →
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total Complaints" value={complaints.length} />
        <StatCard label="Open" value={open} />
        <StatCard label="In Progress" value={inProgress} />
        <StatCard label="Resolved" value={resolved} />
        <StatCard label="Escalated" value={escalated} />
      </div>

      <div>
        <h2 className="mb-3 font-semibold">Recent complaints</h2>
        <ComplaintList complaints={complaints.slice(0, 5)} />
      </div>
    </div>
  );
}
