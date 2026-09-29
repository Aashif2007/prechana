"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getAadhaarProvider, maskAadhaar, isValidAadhaarFormat,
} from "@/services/identity/aadhaarVerification";

function fail(message: string): never {
  redirect("/profile?error=" + encodeURIComponent(message));
}

// Simple rate limit: 5 OTP attempts per hour per user, so the demo/real
// provider can't be hammered by mistake or misuse.
async function checkRateLimit(db: ReturnType<typeof createAdminClient>, userId: string) {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await db
    .from("identity_verifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", hourAgo);
  return (count ?? 0) < 5;
}

export async function sendAadhaarOtp(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const aadhaarNumber = String(formData.get("aadhaarNumber") ?? "").replace(/\s/g, "");
  if (!isValidAadhaarFormat(aadhaarNumber)) {
    fail("Enter a 12-digit Aadhaar number");
  }

  const db = createAdminClient();
  if (!(await checkRateLimit(db, profile.id))) {
    fail("Too many attempts. Please try again later.");
  }

  const provider = getAadhaarProvider();
  let result;
  try {
    result = await provider.sendOtp(aadhaarNumber);
  } catch (error) {
    console.error("Aadhaar sendOtp failed:", error);
    fail("Verification is not available right now. Please try again later.");
  }

  // The full number is used only for this call and to compute the mask below.
  // It is never written to the database.
  await db.from("identity_verifications").insert({
    user_id: profile.id,
    masked_aadhaar: maskAadhaar(aadhaarNumber),
    status: "pending",
    provider: process.env.AADHAAR_PROVIDER === "real" ? "real" : "demo",
    provider_reference: result.reference,
  });

  redirect("/profile?otpSent=1&reference=" + encodeURIComponent(result.reference));
}

const OtpSchema = z.object({
  reference: z.string().min(1).max(100),
  otp: z.string().regex(/^\d{4,8}$/),
});

export async function verifyAadhaarOtp(formData: FormData) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const parsed = OtpSchema.safeParse({
    reference: formData.get("reference"),
    otp: formData.get("otp"),
  });
  if (!parsed.success) fail("Enter the OTP you received");

  const db = createAdminClient();

  // Confirm this reference belongs to this user and is still pending
  const { data: record } = await db
    .from("identity_verifications")
    .select("*")
    .eq("user_id", profile.id)
    .eq("provider_reference", parsed.data.reference)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!record) fail("This verification has expired. Please start again.");

  const provider = getAadhaarProvider();
  let result;
  try {
    result = await provider.verifyOtp(parsed.data.reference, parsed.data.otp);
  } catch (error) {
    console.error("Aadhaar verifyOtp failed:", error);
    fail("Verification is not available right now. Please try again later.");
  }

  if (!result.verified) {
    await db.from("identity_verifications").update({ status: "failed" }).eq("id", record.id);
    fail("Incorrect OTP. Please try again.");
  }

  const now = new Date().toISOString();
  await db.from("identity_verifications")
    .update({ status: "verified", verified_at: now }).eq("id", record.id);
  await db.from("profiles").update({ aadhaar_verified: true }).eq("id", profile.id);

  redirect("/profile?verified=1");
}
