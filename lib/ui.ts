/* ─── Primitive Design Tokens ─────────────────────────────────────────
   All Tailwind class strings used across the app live here.
   The dark theme is the default; classes reference CSS variables
   defined in globals.css.
──────────────────────────────────────────────────────────────────────── */

export const card =
  "glass rounded-2xl p-4 transition-all duration-200";

export const cardInteractive =
  "glass rounded-2xl p-4 transition-all duration-200 hover:border-teal-500/40 hover:shadow-[0_0_20px_rgba(20,184,166,0.12)] cursor-pointer";

export const btn =
  "relative inline-flex items-center justify-center rounded-xl overflow-hidden " +
  "bg-teal-600 px-4 py-2 text-sm font-semibold text-white " +
  "shadow-[0_0_20px_rgba(20,184,166,0.3)] " +
  "hover:bg-teal-500 hover:shadow-[0_0_28px_rgba(20,184,166,0.5)] " +
  "active:scale-[0.97] transition-all duration-200 btn-shimmer";

export const btnLight =
  "inline-flex items-center justify-center rounded-xl " +
  "border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 " +
  "hover:bg-white/10 hover:border-white/20 " +
  "active:scale-[0.97] transition-all duration-200";

export const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 " +
  "placeholder:text-slate-500 " +
  "focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 focus:outline-none " +
  "transition-all duration-200";

export const label =
  "block text-xs font-medium text-slate-400 mb-1.5 tracking-wide uppercase";

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
