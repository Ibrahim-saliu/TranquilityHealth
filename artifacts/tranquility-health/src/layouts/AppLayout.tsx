import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { LeafMark } from "@/components/public/LeafMark";

interface AppLayoutProps {
  children: ReactNode;
}

// A calm, few-destination top bar. No standing "Session" tab — joining a visit
// is a contextual action on the appointment itself.
const NAV_LINKS = [
  { href: "/app/dashboard", label: "Home" },
  { href: "/app/appointments", label: "Appointments" },
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 flex-none">
            <LeafMark className="w-6 h-6 text-teal-700" />
            <span className="font-serif font-semibold text-lg tracking-tight text-slate-900 hidden sm:inline">
              Tranquility Health
            </span>
            <span className="text-[10px] bg-teal-50 text-teal-800 border border-teal-100 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
              Patient
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm font-medium">
            {NAV_LINKS.map(({ href, label }) => {
              const active = location === href || (href !== "/app/dashboard" && location.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    active ? "bg-teal-50 text-teal-800 font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}

            {user && (
              <div className="ml-2 sm:ml-4 flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-4">
                <span className="hidden sm:inline text-xs text-slate-500">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-md hover:bg-red-50"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.9} />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
