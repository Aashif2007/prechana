
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, aadhaar_verified")
    .eq("id", user.id)
    .single();

  if (!profile?.aadhaar_verified) {
    redirect("/aadhaar-verification");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome to PRECHANA 👋
          </h1>

          <p className="mt-2 text-slate-600">
            Hello, {profile.full_name || "Citizen"}!
          </p>

          <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-emerald-700">
            Aadhaar verification completed successfully.
          </div>

          <div className="mt-6">
            <p className="text-sm text-slate-500">Your role</p>
            <p className="font-medium text-slate-900">
              {profile.role || "citizen"}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
