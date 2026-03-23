import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Heart, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

interface AppLayoutProps {
  children: ReactNode;
}

const NAV_LINKS = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/appointments", label: "Appointments" },
  { href: "/app/session", label: "Session" },
] as const;

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

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
            <span className="text-xs bg-teal-500/80 border border-teal-400/40 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
              Patient Portal
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm font-medium">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                location === href || (href !== "/app/dashboard" && location.startsWith(href));
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

            {/* User info + logout */}
            {user && (
              <div className="ml-4 flex items-center gap-2 border-l border-slate-700 pl-4">
                <span className="flex items-center gap-1.5 text-slate-300 text-xs">
                  <User className="w-3.5 h-3.5" />
                  {user.email}
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
