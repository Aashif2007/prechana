"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { addTimelineEvent } from "@/services/timeline/addEvent";
import { notify } from "@/services/notifications/notify";
import { findSlaRule, addHours } from "@/services/sla/slaRules";
import { findAuthorityForLevel, routeComplaint } from "@/services/routing/complaintRouter";

function refresh() {
  revalidatePath("/", "layout");
}

// Loads the complaint and checks the caller is its current authority (or an admin)
async function loadForAuthority(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not logged in");

  const complaintId = z.string().uuid().parse(formData.get("complaintId"));
  const db = createAdminClient();

  const { data: complaint } = await db.from("complaints").select("*").eq("id", complaintId).single();
  if (!complaint) throw new Error("Complaint not found");

  let authority: { id: string; name: string } | null = null;
  if (complaint.current_authority_id) {
    const { data } = await db
      .from("authorities")
      .select("id, name")
      .eq("id", complaint.current_authority_id)
      .eq("user_id", profile.id)
      .maybeSingle();
    authority = data;
  }
  if (!authority && profile.role !== "admin") {
    throw new Error("You are not the assigned authority for this complaint");
  }

  return { db, complaint, actorName: authority ? authority.name : "Admin" };
}

async function tellCitizen(db: any, complaint: any, type: string, message: string) {
  await notify(db, { complaintId: complaint.id, type, message, userId: complaint.citizen_id });
}

export async function acknowledge(formData: FormData) {
  const { db, complaint, actorName } = await loadForAuthority(formData);
  await db.from("complaints")
    .update({ status: "Acknowledged", updated_at: new Date().toISOString() })
    .eq("id", complaint.id);
  await addTimelineEvent(db, complaint.id, "acknowledged", "Complaint acknowledged by " + actorName + ".");
  await tellCitizen(db, complaint, "acknowledged", "Your complaint " + complaint.public_id + " was acknowledged.");
  refresh();
}

export async function startWork(formData: FormData) {
  const { db, complaint, actorName } = await loadForAuthority(formData);
  await db.from("complaints")
    .update({ status: "In Progress", updated_at: new Date().toISOString() })
    .eq("id", complaint.id);
  await addTimelineEvent(db, complaint.id, "work_started", "Work started by " + actorName + ".");
  await tellCitizen(db, complaint, "work_started", "Work has started on complaint " + complaint.public_id + ".");
  refresh();
}

export async function addNote(formData: FormData) {
  const { db, complaint, actorName } = await loadForAuthority(formData);
  const note = z.string().min(1).max(500).parse(formData.get("note"));
  await addTimelineEvent(db, complaint.id, "note", "Note from " + actorName + ": " + note);
  await tellCitizen(db, complaint, "note", "New update on complaint " + complaint.public_id + ".");
  refresh();
}

export async function forwardToDepartment(formData: FormData) {
  const { db, complaint, actorName } = await loadForAuthority(formData);

  const { data: ward } = await db.from("wards").select("city_id").eq("id", complaint.ward_id).single();
  if (!ward) throw new Error("Complaint has no ward");

  const nextLevel = complaint.current_level + 1;
  const nextId = await findAuthorityForLevel(
    db, ward.city_id, complaint.ward_id, complaint.department_category, nextLevel);
  if (!nextId) {
    await addTimelineEvent(db, complaint.id, "routing_failed", "No department officer is configured for this complaint.");
    refresh();
    return;
  }

  const { data: next } = await db.from("authorities").select("name, user_id").eq("id", nextId).single();
  const now = new Date();
  const rule = await findSlaRule(db, ward.city_id, nextLevel, complaint.category, complaint.severity);

  const update: Record<string, unknown> = {
    current_authority_id: nextId,
    current_level: nextLevel,
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
  await db.from("complaints").update(update).eq("id", complaint.id);

  await db.from("complaint_assignments")
    .update({ ended_at: now.toISOString() })
    .eq("complaint_id", complaint.id)
    .is("ended_at", null);
  await db.from("complaint_assignments").insert({
    complaint_id: complaint.id, authority_id: nextId, level: nextLevel,
  });

  await addTimelineEvent(db, complaint.id, "forwarded",
    actorName + " forwarded this to " + next?.name + " (Demo Routing, nothing was sent externally).");
  await notify(db, {
    complaintId: complaint.id,
    type: "assigned",
    message: "Complaint " + complaint.public_id + " was forwarded to you.",
    userId: next?.user_id,
    authorityId: nextId,
  });
  await tellCitizen(db, complaint, "assigned", "Your complaint " + complaint.public_id + " was forwarded to the department.");
  refresh();
}

const CompleteSchema = z.object({
  description: z.string().min(10).max(1000),
  completedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function markCompleted(formData: FormData) {
  const { db, complaint, actorName } = await loadForAuthority(formData);
  const data = CompleteSchema.parse({
    description: formData.get("description"),
    completedOn: formData.get("completedOn"),
  });

  await db.from("complaint_resolution").insert({
    complaint_id: complaint.id,
    authority_id: complaint.current_authority_id,
    description: data.description,
    completed_on: data.completedOn,
  });

  // The SLA timer stops while we wait for the citizen
  await db.from("complaints")
    .update({
      status: "Pending Confirmation",
      sla_due_at: null,
      reminder_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", complaint.id);

  await addTimelineEvent(db, complaint.id, "completed", "Work marked completed by " + actorName + ": " + data.description);
  await addTimelineEvent(db, complaint.id, "confirmation_requested", "Waiting for the citizen to confirm the fix.");
  await tellCitizen(db, complaint, "confirmation", "Is the problem with complaint " + complaint.public_id + " actually fixed? Please confirm.");
  refresh();
}

export async function confirmResolution(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Not logged in");

  const complaintId = z.string().uuid().parse(formData.get("complaintId"));
  const solved = formData.get("solved") === "yes";
  const db = createAdminClient();

  const { data: complaint } = await db
    .from("complaints").select("*").eq("id", complaintId).eq("citizen_id", profile.id).single();
  if (!complaint) throw new Error("Complaint not found");
  if (complaint.status !== "Pending Confirmation" && complaint.status !== "Resolved") {
    throw new Error("There is nothing to confirm right now");
  }

  const { data: latest } = await db
    .from("complaint_resolution")
    .select("id")
    .eq("complaint_id", complaintId)
    .order("created_at", { ascending: false })
    .limit(1);
  const resolutionId = latest?.[0]?.id;
  const now = new Date().toISOString();

  if (solved) {
    if (complaint.status === "Resolved") return;
    if (resolutionId) {
      await db.from("complaint_resolution")
        .update({ citizen_confirmed: true, confirmed_at: now }).eq("id", resolutionId);
    }
    await db.from("complaints").update({ status: "Resolved", updated_at: now }).eq("id", complaintId);
    await addTimelineEvent(db, complaintId, "resolved", "Citizen confirmed the problem is solved.");
    refresh();
    return;
  }

  // Still a problem: reopen and restart the chain from level 1
  if (resolutionId) {
    await db.from("complaint_resolution")
      .update({ citizen_confirmed: false, confirmed_at: now }).eq("id", resolutionId);
  }
  await addTimelineEvent(db, complaintId, "reopened", "Citizen reported the problem is still unresolved. Complaint reopened.");
  await db.from("complaint_assignments").update({ ended_at: now }).eq("complaint_id", complaintId).is("ended_at", null);
  await db.from("complaints").update({ last_reminder_at: null }).eq("id", complaintId);
  await routeComplaint(db, complaintId);
  await db.from("complaints").update({ status: "Reopened" }).eq("id", complaintId);
  refresh();
}
