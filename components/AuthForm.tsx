import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";

type Props = {
  mode: "login" | "signup";
  action: (formData: FormData) => Promise<void>;
  error?: string;
};

export function AuthForm({ mode, action, error }: Props) {
  const isSignup = mode === "signup";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0f1a] px-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 hero-grid" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-teal-500/8 blur-[120px]" />
      <div className="pointer-events-none absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-sky-500/6 blur-[90px]" />

      {/* Card */}
      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="glass rounded-3xl p-7 shadow-[0_0_60px_rgba(20,184,166,0.1)]">
          {/* Logo */}
          <Link href="/" className="block mb-6 text-sm font-extrabold tracking-widest">
            <span className="gradient-text">PRECHANA</span>
          </Link>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-slate-100">
            {isSignup ? "Create an account" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isSignup
              ? "Report civic issues in your area."
              : "Log in to track your complaints."}
          </p>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Form */}
          <form action={action} className="mt-6 space-y-4">
            {isSignup && (
              <div>
                <Label
                  htmlFor="fullName"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  Full name
                </Label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 focus:outline-none transition-all duration-200"
                />
              </div>
            )}
            <div>
              <Label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
              >
                Email
              </Label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 focus:outline-none transition-all duration-200"
              />
            </div>
            <div>
              <Label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
              >
                Password
              </Label>
              <input
                id="password"
                name="password"
                type="password"
                minLength={8}
                required
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 focus:outline-none transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              className="relative mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl overflow-hidden bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(20,184,166,0.3)] hover:bg-teal-500 hover:shadow-[0_0_36px_rgba(20,184,166,0.5)] active:scale-[0.98] transition-all duration-200 btn-shimmer"
            >
              {isSignup ? "Create account" : "Log in"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Toggle */}
          <p className="mt-5 text-center text-sm text-slate-500">
            {isSignup ? "Already have an account? " : "New here? "}
            <Link
              href={isSignup ? "/login" : "/signup"}
              className="font-semibold text-teal-400 hover:text-teal-300 transition-colors"
            >
              {isSignup ? "Log in" : "Sign up"}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
