import type { SupabaseClient } from "@supabase/supabase-js";
import { addTimelineEvent } from "@/services/timeline/addEvent";
import { notify } from "@/services/notifications/notify";
import { findSlaRule, addHours } from "@/services/sla/slaRules";

// Ward-specific authority wins; otherwise fall back to a city-wide one.
export async function findAuthorityForLevel(
  db: SupabaseClient,
  cityId: string,
  wardId: string,
  category: string,
  level: number
): Promise<string | null> {
  const { data } = await db
    .from("authority_hierarchy")
    .select("authority_id, ward_id")
    .eq("city_id", cityId)
    .eq("category", category)
    .eq("level", level);

  let cityWide: string | null = null;
  for (const row of data ?? []) {
    if (row.ward_id === wardId) return row.authority_id;
    if (row.ward_id === null) cityWide = row.authority_id;
  }
  return cityWide;
}

export async function routeComplaint(db: SupabaseClient, complaintId: string) {
  const { data: complaint } = await db
    .from("complaints").select("*").eq("id", complaintId).single();
  if (!complaint) throw new Error("Complaint not found");

  // 1. Ward from coordinates
  const { data: wardId } = await db.rpc("find_ward", {
    p_lat: complaint.latitude,
    p_lng: complaint.longitude,
  });
  if (!wardId) {
    await addTimelineEvent(db, complaintId, "routing_failed",
      "No ward found for this location. Waiting for manual routing.");
    return { routed: false };
  }

  const { data: ward } = await db.from("wards").select("id, city_id").eq("id", wardId).single();
  if (!ward) throw new Error("Ward not found");

  // 2. Level-1 authority from the verified hierarchy table
  const authorityId = await findAuthorityForLevel(
    db, ward.city_id, ward.id, complaint.department_category, 1);
  if (!authorityId) {
    await db.from("complaints").update({ ward_id: ward.id }).eq("id", complaintId);
    await addTimelineEvent(db, complaintId, "routing_failed",
      "No authority is configured for this ward and category.");
    return { routed: false };
  }

  const { data: authority } = await db
    .from("authorities").select("id, name, title, user_id").eq("id", authorityId).single();

  // 3. SLA timer (only if an admin has configured a rule)
  const now = new Date();
  const rule = await findSlaRule(db, ward.city_id, 1, complaint.category, complaint.severity);

  const update: Record<string, unknown> = {
    ward_id: ward.id,
    current_authority_id: authorityId,
    current_level: 1,
    status: "Assigned",
    level_started_at: now.toISOString(),
    last_reminder_at: null,
    reminder_at: null,
    sla_due_at: null,
    updated_at: now.toISOString(),
  };
  if (rule) {
    update.reminder_at = addHours(now, rule.reminder_after_hours).toISOString();
    update.sla_due_at = addHours(now, rule.hours_to_act).toISOString();
  }
  await db.from("complaints").update(update).eq("id", complaintId);

  // 4. Assignment + timeline. Live integrations would replace the demo label here.
  await db.from("complaint_assignments").insert({
    complaint_id: complaintId, authority_id: authorityId, level: 1,
  });

  await addTimelineEvent(db, complaintId, "routed",
    "Demo Routing: assigned to " + authority?.name + " (" + authority?.title + "). No real notification was sent.");

  if (rule) {
    const label = rule.is_demo ? " (demo SLA configuration)" : "";
    await addTimelineEvent(db, complaintId, "sla_started", "SLA timer started" + label + ".");
  } else {
    await addTimelineEvent(db, complaintId, "sla_missing",
      "No SLA rule configured for this category. No reminders will run until an admin adds one.");
  }

  await notify(db, {
    complaintId,
    type: "assigned",
    message: "New complaint " + complaint.public_id + " assigned to you.",
    userId: authority?.user_id,
    authorityId,
  });

  return { routed: true, authorityId };
}
