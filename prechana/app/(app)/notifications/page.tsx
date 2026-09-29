import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { card, btnLight, formatDate } from "@/lib/ui";

const ICONS: Record<string, string> = {
  assigned: "📍", acknowledged: "👤", reminder: "⏰", escalation: "🔼",
  work_started: "🔧", note: "📝", confirmation: "❓",
};

async function markAllRead() {
  "use server";
  const profile = await getCurrentProfile();
  if (!profile) return;
  const supabase = await createClient();
  await supabase
    .from("complaint_notifications")
    .update({ is_read: true })
    .eq("user_id", profile.id)
    .eq("is_read", false);
  revalidatePath("/notifications");
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("complaint_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const items = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notifications</h1>
        <form action={markAllRead}><button className={btnLight}>Mark all read</button></form>
      </div>

      {items.length === 0 && <p className="text-sm text-slate-500">Nothing here yet.</p>}

      {items.map((item) => (
        <Link
          key={item.id}
          href={"/complaints/" + item.complaint_id}
          className={card + " flex gap-3 " + (item.is_read ? "opacity-60" : "")}
        >
          <span className="text-xl">{ICONS[item.type] ?? "🔔"}</span>
          <div>
            <p className="text-sm">{item.message}</p>
            <p className="text-xs text-slate-400">{formatDate(item.created_at)} · in-app only (demo)</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
