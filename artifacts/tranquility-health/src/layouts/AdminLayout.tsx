import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Heart, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

interface AdminLayoutProps {
  children: ReactNode;
}

const ADMIN_NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/providers", label: "Providers" },
  { href: "/admin/team", label: "Team" },
] as const;

const PROVIDER_NAV_LINKS = [
  { href: "/admin/provider-dashboard", label: "Dashboard" },
  { href: "/admin/providers", label: "My Profile" },
] as const;

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  collaborator: "Collaborator",
  provider: "Provider",
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isProvider = user?.role === "provider";
  const navLinks = isProvider ? PROVIDER_NAV_LINKS : ADMIN_NAV_LINKS;
  const roleLabel = user ? (ROLE_LABELS[user.role] ?? "Staff") : "";

  async function handleLogout() {
    await logout();
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-gradient-to-r from-slate-900 via-teal-900 to-indigo-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-indigo-500 shadow-md">
              <Heart className="w-4 h-4 text-white fill-white" />
            </span>
            <span className="text-lg font-bold tracking-tight">Tranquility Health</span>
            <span className="text-xs bg-indigo-500/80 border border-indigo-400/40 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
              {isProvider ? "Provider" : "Admin"}
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm font-medium">
            {navLinks.map(({ href, label }) => {
              const isActive =
                location === href ||
                (href !== "/admin/dashboard" &&
                  href !== "/admin/provider-dashboard" &&
                  location.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    isActive
                      ? "bg-teal-500/25 text-teal-200 border border-teal-500/30"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            {user && (
              <div className="ml-4 flex items-center gap-2 border-l border-slate-700 pl-4">
                <span className="flex items-center gap-1.5 text-slate-300 text-xs">
                  <User className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                  <span className="bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full">
                    {roleLabel}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-300 transition-colors px-2 py-1 rounded-md hover:bg-red-500/10"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
