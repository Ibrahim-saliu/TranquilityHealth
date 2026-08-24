import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutGrid,
  Inbox,
  CalendarDays,
  Stethoscope,
  Users,
  UserRound,
  LogOut,
  Menu,
  X,
  Eye,
  BellRing,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { LeafMark } from "@/components/public/LeafMark";

interface AdminLayoutProps {
  children: ReactNode;
}

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavGroup = { group: string | null; items: NavItem[] };

const ADMIN_NAV: NavGroup[] = [
  { group: null, items: [{ href: "/admin/dashboard", label: "Overview", icon: LayoutGrid }] },
  {
    group: "Patients",
    items: [
      { href: "/admin/requests", label: "Requests", icon: Inbox },
      { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
    ],
  },
  {
    group: "Clinic",
    items: [
      { href: "/admin/providers", label: "Providers", icon: Stethoscope },
      { href: "/admin/team", label: "Team", icon: Users },
      { href: "/admin/notifications", label: "Request alerts", icon: BellRing },
    ],
  },
];

const COLLABORATOR_NAV: NavGroup[] = [
  { group: null, items: [{ href: "/admin/dashboard", label: "Overview", icon: LayoutGrid }] },
  {
    group: "Patients",
    items: [
      { href: "/admin/requests", label: "Requests", icon: Inbox },
      { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
    ],
  },
  {
    group: "Clinic",
    items: [
      { href: "/admin/providers", label: "Providers", icon: Stethoscope },
      { href: "/admin/team", label: "Team", icon: Users },
    ],
  },
];

const PROVIDER_NAV: NavGroup[] = [
  {
    group: null,
    items: [
      { href: "/admin/provider-dashboard", label: "Dashboard", icon: LayoutGrid },
      { href: "/admin/providers", label: "My Profile", icon: UserRound },
    ],
  },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  collaborator: "Collaborator",
  provider: "Provider",
};

// A dashboard/overview link should only be "active" on an exact match; section
// links also match their sub-routes.
function isActive(location: string, href: string): boolean {
  const exactOnly = href === "/admin/dashboard" || href === "/admin/provider-dashboard";
  return location === href || (!exactOnly && location.startsWith(href));
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isProvider = user?.role === "provider";
  const nav = isProvider
    ? PROVIDER_NAV
    : user?.role === "admin"
      ? ADMIN_NAV
      : COLLABORATOR_NAV;
  const roleLabel = user ? (ROLE_LABELS[user.role] ?? "Staff") : "";
  const initial = (user?.email ?? "?").charAt(0).toUpperCase();

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  const navBody = (
    <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
      {nav.map((section, gi) => (
        <div key={gi} className="pb-1">
          {section.group && (
            <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {section.group}
            </p>
          )}
          {section.items.map(({ href, label, icon: Icon }) => {
            const active = isActive(location, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-teal-50 text-teal-800 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${active ? "text-teal-700" : "text-slate-400"}`} strokeWidth={1.9} />
                {label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-slate-200 px-3 py-3">
      {!isProvider && (
        <Link
          href="/admin/provider-dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 px-3 py-1.5 mb-2 text-xs text-slate-500 hover:text-teal-700 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" strokeWidth={1.9} />
          View as provider
        </Link>
      )}
      <div className="flex items-center gap-2.5 px-3 py-1">
        <span className="flex-none w-8 h-8 rounded-full bg-teal-50 text-teal-800 grid place-items-center text-xs font-bold">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-800 truncate">{user?.email}</p>
          <p className="text-[11px] text-slate-400">{roleLabel}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex-none p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.9} />
        </button>
      </div>
    </div>
  );

  const brand = (
    <Link href="/" className="flex items-center gap-2.5 px-5 h-16 flex-none border-b border-slate-200">
      <LeafMark className="w-6 h-6 text-teal-700" />
      <span className="font-serif font-semibold text-lg tracking-tight text-slate-900">Tranquility</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:flex-none bg-white border-r border-slate-200 h-screen sticky top-0">
        {brand}
        {navBody}
        {footer}
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200">
        <Link href="/" className="flex items-center gap-2">
          <LeafMark className="w-6 h-6 text-teal-700" />
          <span className="font-serif font-semibold text-base text-slate-900">Tranquility</span>
        </Link>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="p-2 rounded-md text-slate-600 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-30 bg-white flex flex-col">
          {navBody}
          {footer}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
