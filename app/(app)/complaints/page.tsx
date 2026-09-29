import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ComplaintList } from "@/components/ComplaintList";

export default async function MyComplaintsPage() {
  await requireRole(["citizen"]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("complaints")
    .select("*, wards(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">My Complaints</h1>
      <ComplaintList complaints={data ?? []} />
    </div>
  );
}
