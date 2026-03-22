// TODO (Phase 3): Add role guard — only users with admin role may access these routes
import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Heart } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
}

const NAV_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/providers", label: "Providers" },
] as const;

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();

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
              Admin
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm font-medium">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = location === href || (href !== "/admin/dashboard" && location.startsWith(href));
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
            {/* TODO (Phase 3): Replace with authenticated user info and logout */}
            <span className="ml-4 text-slate-500 text-xs italic border-l border-slate-700 pl-4">
              Auth — Phase 3
            </span>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
