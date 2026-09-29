import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  mode: "login" | "signup";
  action: (formData: FormData) => Promise<void>;
  error?: string;
};

export function AuthForm({ mode, action, error }: Props) {
  const isSignup = mode === "signup";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <Link href="/" className="text-sm font-bold tracking-wide text-emerald-700">PRECHANA</Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          {isSignup ? "Create your account" : "Log in"}
        </h1>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <form action={action} className="mt-5 space-y-4">
          {isSignup && (
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" required />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>
          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
            {isSignup ? "Sign up" : "Log in"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          {isSignup ? "Already have an account? " : "New here? "}
          <Link href={isSignup ? "/login" : "/signup"} className="font-medium text-emerald-700">
            {isSignup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </div>
    </main>
  );
}
