import type { SupabaseClient } from "@supabase/supabase-js";

type NotifyInput = {
  complaintId: string;
  type: string;
  message: string;
  userId?: string | null;
  authorityId?: string | null;
};

// In-app only for now. Email / WhatsApp / SMS providers plug in here later.
export async function notify(db: SupabaseClient, input: NotifyInput) {
  const { error } = await db.from("complaint_notifications").insert({
    complaint_id: input.complaintId,
    type: input.type,
    message: input.message,
    user_id: input.userId ?? null,
    authority_id: input.authorityId ?? null,
    channel: "in_app",
  });
  if (error) console.error("Notification insert failed:", error.message);
}
