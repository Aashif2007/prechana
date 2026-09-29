import Link from "next/link";
import { logout } from "@/app/login/actions";
import type { Role } from "@/lib/auth";

const LINKS: Record<Role, { href: string; label: string }[]> = {
  citizen: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/report", label: "Report Problem" },
    { href: "/complaints", label: "My Complaints" },
    { href: "/notifications", label: "Notifications" },
    { href: "/profile", label: "Profile" },
  ],
  councillor: [
    { href: "/authority/dashboard", label: "My Area" },
    { href: "/notifications", label: "Notifications" },
    { href: "/profile", label: "Profile" },
  ],
  department: [
    { href: "/department/dashboard", label: "Assigned Work" },
    { href: "/notifications", label: "Notifications" },
    { href: "/profile", label: "Profile" },
  ],
  admin: [
    { href: "/admin", label: "Admin" },
    { href: "/notifications", label: "Notifications" },
    { href: "/profile", label: "Profile" },
  ],
};

export function AppNav({ role, name }: { role: Role; name: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0f1a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="font-extrabold tracking-widest text-sm">
          <span className="gradient-text">PRECHANA</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex flex-1 flex-wrap gap-1 text-sm">
          {LINKS[role].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 font-medium text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-3 py-1.5">
            <span className="h-6 w-6 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-xs font-bold text-teal-400">
              {name.charAt(0).toUpperCase()}
            </span>
            <span className="text-xs text-slate-400 max-w-[120px] truncate">{name}</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 capitalize">
              {role}
            </span>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all duration-200"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
