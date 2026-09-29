import Link from "next/link";
import {
  Construction, Lightbulb, Trash2, Waves, Droplets,
  Route, Trees, Building2, Wrench, Check,
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
  { icon: Droplets, label: "Water leakage" },
  { icon: Route, label: "Damaged roads" },
  { icon: Trees, label: "Fallen trees" },
  { icon: Building2, label: "Public infrastructure" },
  { icon: Wrench, label: "Other civic issues" },
];

const REASONS = [
  "Photo-based reporting", "Location-aware routing",
  "AI-assisted classification", "Transparent complaint timeline",
  "Automated reminders", "Escalation workflow",
  "Citizen confirmation", "Resolution evidence",
];

const primaryBtn =
  "inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white shadow-sm hover:bg-emerald-700";
const secondaryBtn =
  "inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-800 hover:bg-slate-50";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <span className="text-lg font-bold tracking-wide text-emerald-700">PRECHANA</span>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/login" className="text-slate-700 hover:text-slate-900">Log in</Link>
          <Link href="/signup" className="rounded-lg bg-slate-900 px-4 py-2 text-white">Sign up</Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">PRECHANA</h1>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">Your Problem. The Right Authority.</p>
          <p className="mt-4 max-w-xl text-slate-600">
            Report civic problems with a photo and location. PRECHANA routes your complaint,
            tracks every action, reminds responsible authorities, and follows it until resolution.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/report" className={primaryBtn}>Report a Problem</Link>
            <Link href="/complaints" className={secondaryBtn}>Track Complaint</Link>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-slate-500">PCH-2026-000123</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">Escalated</span>
          </div>
          <p className="mt-3 font-semibold">Streetlight not working</p>
          <p className="text-sm text-slate-500">Peelamedu · Severity: Medium</p>
          <ol className="mt-4 space-y-3 border-l-2 border-emerald-200 pl-4 text-sm">
            <li>🟢 Complaint submitted</li>
            <li>📍 Routed to ward-level authority</li>
            <li>🔔 Reminder sent</li>
            <li>🔼 Escalated to Electrical Services</li>
          </ol>
          <p className="mt-4 text-xs text-slate-400">DEMO DATA · Demo Routing, nothing is sent to a real authority</p>
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">How It Works</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.title} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="text-2xl">{step.icon}</div>
                <p className="mt-2 font-semibold">{index + 1}. {step.title}</p>
                <p className="mt-1 text-sm text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold">Problems We Handle</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {PROBLEMS.map((problem) => {
            const Icon = problem.icon;
            return (
              <div key={problem.label} className="flex items-center gap-3 rounded-2xl p-4 shadow-sm ring-1 ring-slate-200">
                <span className="rounded-xl bg-sky-50 p-2 text-sky-700"><Icon className="h-5 w-5" /></span>
                <span className="text-sm font-medium">{problem.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">Why PRECHANA?</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {REASONS.map((reason) => (
              <li key={reason} className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <Check className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Have a problem in your area? Report it now.</h2>
        <p className="mt-2 text-slate-600">Report it. Track it. Resolve it.</p>
        <Link href="/report" className={primaryBtn + " mt-6"}>Report a Problem</Link>
      </section>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        PRECHANA is in demo mode. Complaints are not sent to real government authorities.
      </footer>
    </div>
  );
}
