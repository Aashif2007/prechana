import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { WorkQueue } from "@/components/WorkQueue";

export default async function DepartmentDashboardPage() {
  await requireRole(["department"]);
  const supabase = await createClient();

  const { data } = await supabase
    .from("complaints")
    .select("*, wards(name)")
    .order("sla_due_at", { ascending: true, nullsFirst: false });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Assigned Work</h1>
      <WorkQueue complaints={data ?? []} mode="department" />
    </div>
  );
}
