
"use server";

import { redirect } from "next/navigation";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const SignupSchema = LoginSchema.extend({
  fullName: z.string().min(2).max(80),
});

export async function login(formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(
      "/login?error=" +
        encodeURIComponent("Enter a valid email and password")
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword(
    parsed.data
  );

  if (error || !data.user) {
    redirect(
      "/login?error=" +
        encodeURIComponent("Invalid email or password")
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const role = profile?.role ?? "citizen";

  redirect(role === "citizen" ? "/dashboard" : "/dashboard");
}

export async function signup(formData: FormData) {
  const parsed = SignupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(
      "/signup?error=" +
        encodeURIComponent(
          "Check your name, email, and use 8+ characters for the password"
        )
    );
  }

  // Create the Supabase account
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    redirect(
      "/signup?error=" + encodeURIComponent(error.message)
    );
  }

  // After successful signup, go to demo Aadhaar verification
  redirect("/aadhaar-verification");
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/");
}
