/**
 * AppLayout — authenticated patient application shell.
 *
 * This is a placeholder layout for the secure patient-facing app.
 * Renders a simple top bar indicating the authenticated area and
 * wraps the page content.
 *
 * TODO (Phase 3): Replace this placeholder with:
 *  - Session validation / redirect to login if unauthenticated
 *  - Patient sidebar navigation
 *  - User profile/avatar in top bar
 *  - Notification badge for pending items
 */

import { ReactNode } from "react";
import { Link } from "wouter";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* App shell top bar — TODO (Phase 3): Replace with authenticated header */}
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
            {/* TODO (Phase 3): Add logout / profile controls */}
            <span className="text-teal-300 text-xs italic">
              [Auth placeholder]
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
