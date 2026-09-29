import type { SupabaseClient } from "@supabase/supabase-js";

export type SlaRule = {
  reminder_after_hours: number;
  hours_to_act: number;
  is_demo: boolean;
};

export function addHours(from: Date, hours: number): Date {
  return new Date(from.getTime() + hours * 60 * 60 * 1000);
}

// Picks the most specific rule: category match beats severity match.
// No rule configured = no timer (nothing is hard-coded).
export async function findSlaRule(
  db: SupabaseClient,
  cityId: string,
  level: number,
  category: string,
  severity: string
): Promise<SlaRule | null> {
  const { data } = await db
    .from("sla_rules")
    .select("*")
    .eq("city_id", cityId)
    .eq("level", level);

  const rules = data ?? [];
  let best: SlaRule | null = null;
  let bestScore = -1;

  for (const rule of rules) {
    if (rule.category !== null && rule.category !== category) continue;
    if (rule.severity !== null && rule.severity !== severity) continue;

    let score = 0;
    if (rule.category !== null) score += 2;
    if (rule.severity !== null) score += 1;

    if (score > bestScore) {
      best = rule;
      bestScore = score;
    }
  }
  return best;
}
