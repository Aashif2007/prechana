"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { routeComplaint } from "@/services/routing/complaintRouter";
import { runEscalationCheck } from "@/services/escalation/escalationEngine";

const ACTIVE = ["Assigned", "Acknowledged", "In Progress", "Awaiting Action", "Escalated", "Reopened"];

export async function routePending() {
  await requireRole(["admin"]);
  const db = createAdminClient();

  const { data } = await db
    .from("complaints").select("id").eq("status", "Submitted").is("current_authority_id", null);
  for (const row of data ?? []) {
    await routeComplaint(db, row.id);
  }
  revalidatePath("/", "layout");
}

export async function runCheckNow() {
  await requireRole(["admin"]);
  await runEscalationCheck(createAdminClient());
  revalidatePath("/", "layout");
}

// DEMO ONLY: pull the next deadline into the past, then run the real engine
export async function advanceDemoClock() {
  await requireRole(["admin"]);
  const db = createAdminClient();
  const past = new Date(Date.now() - 1000).toISOString();

  const { data } = await db
    .from("complaints")
    .select("id, last_reminder_at, sla_due_at")
    .in("status", ACTIVE)
    .not("sla_due_at", "is", null);

  for (const c of data ?? []) {
    if (c.last_reminder_at === null) {
      await db.from("complaints").update({ reminder_at: past }).eq("id", c.id);
    } else {
      await db.from("complaints").update({ sla_due_at: past }).eq("id", c.id);
    }
  }

  await runEscalationCheck(db);
  revalidatePath("/", "layout");
}
