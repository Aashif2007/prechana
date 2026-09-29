import type { SupabaseClient } from "@supabase/supabase-js";

export async function addTimelineEvent(
  db: SupabaseClient,
  complaintId: string,
  eventType: string,
  message: string,
  metadata: Record<string, unknown> = {}
) {
  const { error } = await db
    .from("complaint_status_history")
    .insert({ complaint_id: complaintId, event_type: eventType, message, metadata });
  if (error) console.error("Timeline insert failed:", error.message);
}
