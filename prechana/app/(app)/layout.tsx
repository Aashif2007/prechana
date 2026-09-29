import { redirect } from "next/navigation";
import { getCurrentProfile, type Role } from "@/lib/auth";
import { AppNav } from "@/components/AppNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppNav role={profile.role as Role} name={profile.full_name ?? "Account"} />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
