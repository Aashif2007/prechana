import type { SupabaseClient } from "@supabase/supabase-js";
import { addTimelineEvent } from "@/services/timeline/addEvent";
import { notify } from "@/services/notifications/notify";
import { findSlaRule, addHours } from "@/services/sla/slaRules";
import { findAuthorityForLevel } from "@/services/routing/complaintRouter";

const ACTIVE_STATUSES = [
  "Assigned", "Acknowledged", "In Progress", "Awaiting Action",
  "Escalated", "Overdue", "Reopened",
];

// Call this from a cron job / scheduled function, or from the admin demo controls.
export async function runEscalationCheck(db: SupabaseClient, now: Date = new Date()) {
  const summary = { reminders: 0, escalations: 0 };

  const { data: complaints } = await db
    .from("complaints")
    .select("*")
    .in("status", ACTIVE_STATUSES)
    .not("sla_due_at", "is", null);

  for (const complaint of complaints ?? []) {
    const dueAt = new Date(complaint.sla_due_at);

    // Deadline passed: escalate (this takes priority over a reminder)
    if (now >= dueAt) {
      const escalated = await escalateComplaint(db, complaint, now);
      if (escalated) summary.escalations += 1;
      continue;
    }

    // Reminder time passed and none sent yet at this level
    if (complaint.reminder_at && !complaint.last_reminder_at) {
      const reminderAt = new Date(complaint.reminder_at);
      if (now >= reminderAt) {
        await sendReminder(db, complaint, now);
        summary.reminders += 1;
      }
    }
  }
  return summary;
}

async function sendReminder(db: SupabaseClient, complaint: any, now: Date) {
  const { data: authority } = await db
    .from("authorities").select("name, user_id").eq("id", complaint.current_authority_id).single();

  await db.from("complaints")
    .update({ last_reminder_at: now.toISOString() }).eq("id", complaint.id);

  await addTimelineEvent(db, complaint.id, "reminder",
    "Reminder generated for " + authority?.name + " (demo: no real message sent).");

  await notify(db, {
    complaintId: complaint.id,
    type: "reminder",
    message: "Reminder: complaint " + complaint.public_id + " still needs action.",
    userId: authority?.user_id,
    authorityId: complaint.current_authority_id,
  });
}

async function escalateComplaint(db: SupabaseClient, complaint: any, now: Date): Promise<boolean> {
  const nextLevel = complaint.current_level + 1;

  const { data: ward } = await db
    .from("wards").select("city_id").eq("id", complaint.ward_id).single();
  if (!ward) return false;

  const nextAuthorityId = await findAuthorityForLevel(
    db, ward.city_id, complaint.ward_id, complaint.department_category, nextLevel);

  // Top of the chain: mark overdue once and stop
  if (!nextAuthorityId) {
    if (complaint.status !== "Overdue") {
      await db.from("complaints").update({ status: "Overdue" }).eq("id", complaint.id);
      await addTimelineEvent(db, complaint.id, "overdue",
        "SLA breached and no higher authority is configured.");
    }
    return false;
  }

  const { data: nextAuthority } = await db
    .from("authorities").select("name, title, user_id").eq("id", nextAuthorityId).single();

  const rule = await findSlaRule(
    db, ward.city_id, nextLevel, complaint.category, complaint.severity);

  const update: Record<string, unknown> = {
    current_authority_id: nextAuthorityId,
    current_level: nextLevel,
    status: "Escalated",
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
  await db.from("complaints").update(update).eq("id", complaint.id);

  // Close the old assignment, open the new one
  await db.from("complaint_assignments")
    .update({ ended_at: now.toISOString() })
    .eq("complaint_id", complaint.id)
    .is("ended_at", null);
  await db.from("complaint_assignments").insert({
    complaint_id: complaint.id, authority_id: nextAuthorityId, level: nextLevel,
  });

  await db.from("complaint_escalations").insert({
    complaint_id: complaint.id,
    from_authority_id: complaint.current_authority_id,
    to_authority_id: nextAuthorityId,
    from_level: complaint.current_level,
    to_level: nextLevel,
    reason: "SLA deadline passed without action",
  });

  await addTimelineEvent(db, complaint.id, "escalated",
    "Escalated to level " + nextLevel + ": " + nextAuthority?.name + " (" + nextAuthority?.title + ") due to SLA breach.");

  await notify(db, {
    complaintId: complaint.id,
    type: "escalation",
    message: "Complaint " + complaint.public_id + " was escalated to you.",
    userId: nextAuthority?.user_id,
    authorityId: nextAuthorityId,
  });
  await notify(db, {
    complaintId: complaint.id,
    type: "escalation",
    message: "Your complaint " + complaint.public_id + " was escalated to the next authority.",
    userId: complaint.citizen_id,
  });

  return true;
}
