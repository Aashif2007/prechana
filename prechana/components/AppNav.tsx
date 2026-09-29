import Link from "next/link";
import { logout } from "@/app/login/actions";
import type { Role } from "@/lib/auth";

const LINKS: Record<Role, { href: string; label: string }[]> = {
  citizen: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/report", label: "Report Problem" },
    { href: "/complaints", label: "My Complaints" },
    { href: "/notifications", label: "Notifications" },
  ],
  councillor: [
    { href: "/authority/dashboard", label: "My Area" },
    { href: "/notifications", label: "Notifications" },
  ],
  department: [
    { href: "/department/dashboard", label: "Assigned Work" },
    { href: "/notifications", label: "Notifications" },
  ],
  admin: [
    { href: "/admin", label: "Admin" },
    { href: "/notifications", label: "Notifications" },
  ],
};

export function AppNav({ role, name }: { role: Role; name: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
        <Link href="/" className="font-bold tracking-wide text-emerald-700">PRECHANA</Link>
        <nav className="flex flex-1 flex-wrap gap-4 text-sm font-medium text-slate-700">
          {LINKS[role].map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-emerald-700">{link.label}</Link>
          ))}
        </nav>
        <span className="text-xs text-slate-500">{name} · {role}</span>
        <form action={logout}>
          <button className="text-sm font-medium text-slate-700 hover:text-red-600">Log out</button>
        </form>
      </div>
    </header>
  );
}
