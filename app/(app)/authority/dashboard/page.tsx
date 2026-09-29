import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { WorkQueue } from "@/components/WorkQueue";

export default async function AuthorityDashboardPage() {
  await requireRole(["councillor"]);
  const supabase = await createClient();

  // RLS only returns complaints currently assigned to this user's authority
  const { data } = await supabase
    .from("complaints")
    .select("*, wards(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">My Area</h1>
      <WorkQueue complaints={data ?? []} mode="councillor" />
    </div>
  );
}
