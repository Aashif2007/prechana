import Link from "next/link";
import {
  Construction, Lightbulb, Trash2, Waves, Droplets,
  Route, Trees, Building2, Wrench, Check, ArrowRight,
  MapPin, Shield, Zap, Clock,
} from "lucide-react";

const STEPS = [
  { icon: "📸", title: "Report", text: "Add a photo, location and a short description." },
  { icon: "🤖", title: "Identify", text: "AI suggests the issue type. You can correct it." },
  { icon: "📍", title: "Route", text: "Your ward's authority is found from a verified database." },
  { icon: "🔔", title: "Remind", text: "Reminders go out when the response time passes." },
  { icon: "🔼", title: "Escalate", text: "No action? It moves up the authority chain." },
  { icon: "✅", title: "Resolve", text: "You confirm whether it is really fixed." },
];

const PROBLEMS = [
  { icon: Construction, label: "Potholes" },
  { icon: Lightbulb, label: "Streetlights" },
  { icon: Trash2, label: "Garbage" },
  { icon: Waves, label: "Drainage" },
  { icon: Droplets, label: "Water Leakage" },
  { icon: Route, label: "Damaged Roads" },
  { icon: Trees, label: "Fallen Trees" },
  { icon: Building2, label: "Public Infrastructure" },
  { icon: Wrench, label: "Other Civic Issues" },
];

const REASONS = [
  { icon: "📷", text: "Photo-based reporting" },
  { icon: "📍", text: "Location-aware routing" },
  { icon: "🤖", text: "AI-assisted classification" },
  { icon: "📋", text: "Transparent complaint timeline" },
  { icon: "🔔", text: "Automated reminders" },
  { icon: "🔼", text: "Escalation workflow" },
  { icon: "✅", text: "Citizen confirmation" },
  { icon: "📸", text: "Resolution evidence" },
];

const STATS = [
  { label: "Complaints Resolved", value: "2,400+", icon: Check },
  { label: "Avg. Resolution Time", value: "3.2 days", icon: Clock },
  { label: "Wards Covered", value: "120+", icon: MapPin },
  { label: "Authorities Linked", value: "48", icon: Shield },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-100 overflow-x-hidden">

      {/* ── NAV ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0f1a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold tracking-widest">
            <span className="gradient-text">PRECHANA</span>
          </span>
          <nav className="flex items-center gap-3 text-sm font-medium">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="relative inline-flex items-center justify-center rounded-xl overflow-hidden bg-teal-600 px-5 py-2 text-white font-semibold shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:bg-teal-500 hover:shadow-[0_0_28px_rgba(20,184,166,0.5)] active:scale-[0.97] transition-all duration-200 btn-shimmer"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative hero-grid overflow-hidden">
        {/* Radial glow blobs */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-sky-500/8 blur-[100px]" />
        <div className="pointer-events-none absolute top-40 -left-20 h-[300px] w-[300px] rounded-full bg-violet-500/8 blur-[90px]" />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-24 lg:grid-cols-2 lg:items-center">
          {/* Left */}
          <div className="animate-fade-up">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-400">
              <span className="status-dot bg-teal-400 animate-pulse-ring" />
              Live in Coimbatore — Demo Mode
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1] sm:text-6xl">
              Your Problem.
              <br />
              <span className="gradient-text">The Right Authority.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-400 leading-relaxed">
              Report civic problems with a photo and location. PRECHANA routes your complaint,
              tracks every action, reminds responsible authorities, and follows it until resolution.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/report"
                className="relative inline-flex items-center justify-center gap-2 rounded-xl overflow-hidden bg-teal-600 px-7 py-3.5 text-base font-semibold text-white shadow-[0_0_30px_rgba(20,184,166,0.35)] hover:bg-teal-500 hover:shadow-[0_0_40px_rgba(20,184,166,0.55)] active:scale-[0.97] transition-all duration-200 btn-shimmer"
              >
                Report a Problem <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/complaints"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-base font-medium text-slate-200 hover:bg-white/10 hover:border-white/20 active:scale-[0.97] transition-all duration-200"
              >
                Track Complaint
              </Link>
            </div>

            {/* Mini stats row */}
            <div className="mt-10 flex flex-wrap gap-6">
              {STATS.map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-teal-500" />
                  <span className="text-sm font-semibold text-white">{value}</span>
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Demo card */}
          <div className="animate-fade-up delay-200">
            <div className="glass rounded-3xl p-6 shadow-[0_0_60px_rgba(20,184,166,0.12)] animate-float">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-slate-500">PCH-2026-000123</span>
                <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-orange-400">
                  Escalated
                </span>
              </div>
              <p className="mt-3 text-base font-semibold text-slate-100">Streetlight not working</p>
              <p className="text-sm text-slate-500">Peelamedu · Severity: Medium</p>

              {/* Timeline */}
              <ol className="mt-5 space-y-4 relative ml-3 border-l border-teal-500/30 pl-5">
                {[
                  { icon: "🟢", text: "Complaint submitted" },
                  { icon: "📍", text: "Routed to ward-level authority" },
                  { icon: "🔔", text: "Reminder sent after 48 h" },
                  { icon: "🔼", text: "Escalated to Electrical Services" },
                ].map((item, i) => (
                  <li key={i} className="relative text-sm text-slate-300 flex gap-2 items-start">
                    <span className="absolute -left-[26px] flex h-7 w-7 items-center justify-center rounded-full bg-[#0a0f1a] text-sm ring-1 ring-teal-500/30">
                      {item.icon}
                    </span>
                    {item.text}
                  </li>
                ))}
              </ol>

              <p className="mt-5 rounded-xl border border-white/5 bg-white/3 px-3 py-2 text-center text-xs text-slate-500">
                DEMO DATA · Nothing is sent to a real authority
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-teal-500">
            The Process
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
            Six steps from a photo on your phone to a confirmed fix on the ground.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className={`glass rounded-2xl p-5 transition-all duration-300 hover:border-teal-500/40 hover:shadow-[0_0_24px_rgba(20,184,166,0.1)] animate-fade-up delay-${(index + 1) * 100}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-xl border border-teal-500/20">
                    {step.icon}
                  </span>
                  <span className="text-xs font-bold text-teal-500 uppercase tracking-widest">
                    Step {index + 1}
                  </span>
                </div>
                <p className="font-semibold text-slate-100">{step.title}</p>
                <p className="mt-1 text-sm text-slate-400 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEMS ───────────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5 bg-white/[0.01]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-teal-500">
            Categories
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Problems We Handle
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PROBLEMS.map((problem) => {
              const Icon = problem.icon;
              return (
                <div
                  key={problem.label}
                  className="group glass rounded-2xl flex items-center gap-3 p-4 hover:border-teal-500/40 hover:shadow-[0_0_20px_rgba(20,184,166,0.1)] transition-all duration-200 cursor-pointer"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 group-hover:bg-teal-500/20 transition-colors duration-200">
                    <Icon className="h-4 w-4 text-teal-400" />
                  </span>
                  <span className="text-sm font-medium text-slate-200">{problem.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY PRECHANA ───────────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-teal-500">
            Why Choose Us
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Why PRECHANA?
          </h2>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {REASONS.map((reason) => (
              <li
                key={reason.text}
                className="glass rounded-xl flex items-center gap-3 p-4 hover:border-teal-500/40 transition-all duration-200"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20 text-base">
                  {reason.icon}
                </span>
                <span className="text-sm font-medium text-slate-200">{reason.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────── */}
      <section className="relative py-24 border-t border-white/5 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[500px] rounded-full bg-teal-500/8 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-400">
            <Zap className="h-3 w-3" /> Free to use · No registration fee
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
            Have a problem in your area?
            <br />
            <span className="gradient-text">Report it now.</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">Report it. Track it. Resolve it.</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/report"
              className="relative inline-flex items-center justify-center gap-2 rounded-xl overflow-hidden bg-teal-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(20,184,166,0.35)] hover:bg-teal-500 hover:shadow-[0_0_50px_rgba(20,184,166,0.6)] active:scale-[0.97] transition-all duration-200 btn-shimmer"
            >
              Report a Problem <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-white/10 px-8 py-4 text-base font-medium text-slate-300 hover:bg-white/5 hover:border-white/20 active:scale-[0.97] transition-all duration-200"
            >
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <span className="font-bold text-sm tracking-widest gradient-text">PRECHANA</span>
          <p className="text-xs text-slate-600 text-center">
            Demo mode — Complaints are not sent to real government authorities.
          </p>
          <p className="text-xs text-slate-600">© 2026 PRECHANA</p>
        </div>
      </footer>
    </div>
  );
}
