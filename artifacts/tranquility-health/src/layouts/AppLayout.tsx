// TODO (Phase 3): Add session guard, sidebar nav, profile controls.
import { ReactNode } from "react";
import { Link } from "wouter";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-teal-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              Tranquility Health
            </span>
            <span className="text-xs bg-teal-500 px-2 py-0.5 rounded-full font-medium">
              Patient Portal
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/app/dashboard"
              className="hover:text-teal-200 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/app/appointments"
              className="hover:text-teal-200 transition-colors"
            >
              Appointments
            </Link>
            <Link
              href="/app/session"
              className="hover:text-teal-200 transition-colors"
            >
              Session
            </Link>
            <span className="text-teal-300 text-xs italic">[Auth — Phase 3]</span>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
