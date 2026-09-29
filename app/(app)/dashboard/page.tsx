import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/StatCard";
import { ComplaintList } from "@/components/ComplaintList";
import { btn } from "@/lib/ui";
import { ArrowRight, AlertCircle } from "lucide-react";

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
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-500 mb-1">Dashboard</p>
          <h1 className="text-2xl font-bold text-slate-100">
            Hello, {profile.full_name} 👋
          </h1>
        </div>
        <Link
          href="/report"
          className="relative inline-flex items-center justify-center gap-2 rounded-xl overflow-hidden bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:bg-teal-500 hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] active:scale-[0.97] transition-all duration-200 btn-shimmer"
        >
          Report a Problem <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Aadhaar banner */}
      {!profile.aadhaar_verified && (
        <Link
          href="/profile"
          className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-300 hover:bg-amber-500/15 hover:border-amber-500/50 transition-all duration-200"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-400" />
          <span>
            Verify your identity with Aadhaar to build trust with authorities reviewing your complaints.{" "}
            <span className="font-semibold underline underline-offset-2">Complete verification →</span>
          </span>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total" value={complaints.length} accent="teal" />
        <StatCard label="Open" value={open} accent="sky" />
        <StatCard label="In Progress" value={inProgress} accent="violet" />
        <StatCard label="Resolved" value={resolved} accent="green" />
        <StatCard label="Escalated" value={escalated} accent="amber" />
      </div>

      {/* Recent complaints */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-200">Recent complaints</h2>
          <Link href="/complaints" className="text-xs text-teal-500 hover:text-teal-400 transition-colors">
            View all →
          </Link>
        </div>
        <ComplaintList complaints={complaints.slice(0, 5)} />
      </div>
    </div>
  );
}
