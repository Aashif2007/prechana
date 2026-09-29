
"use server";

import { createClient } from "@/lib/supabase/server";

export async function markAadhaarVerified() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "You must be logged in to verify your account.",
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ aadhaar_verified: true })
    .eq("id", user.id);

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}
