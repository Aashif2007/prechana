import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "citizen" | "councillor" | "department" | "admin";

export function homeForRole(role: Role): string {
  if (role === "admin") return "/admin";
  if (role === "councillor") return "/authority/dashboard";
  if (role === "department") return "/department/dashboard";
  return "/dashboard";
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, aadhaar_verified")
    .eq("id", data.user.id)
    .single();
  return profile;
}

export async function requireRole(allowed: Role[]) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const role = profile.role as Role;
  if (!allowed.includes(role)) redirect(homeForRole(role));
  return profile;
}
