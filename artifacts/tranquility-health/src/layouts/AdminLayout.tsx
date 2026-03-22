/**
 * AdminLayout — admin dashboard shell.
 *
 * This is a placeholder layout for the admin-facing interface.
 * Provides a distinct visual treatment from the patient portal.
 *
 * TODO (Phase 3): Replace this placeholder with:
 *  - Role verification (admin only — redirect others)
 *  - Admin sidebar with section groupings
 *  - Activity log feed panel
 *  - Notification center
 */

import { ReactNode } from "react";
import { Link } from "wouter";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Admin shell top bar — TODO (Phase 3): Replace with admin nav */}
      <header className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              Tranquility Health
            </span>
            <span className="text-xs bg-amber-500 text-gray-900 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
              Admin
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/admin/dashboard"
              className="hover:text-gray-300 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/requests"
              className="hover:text-gray-300 transition-colors"
            >
              Requests
            </Link>
            <Link
              href="/admin/appointments"
              className="hover:text-gray-300 transition-colors"
            >
              Appointments
            </Link>
            <Link
              href="/admin/providers"
              className="hover:text-gray-300 transition-colors"
            >
              Providers
            </Link>
            {/* TODO (Phase 3): Add admin logout / role verification */}
            <span className="text-gray-500 text-xs italic">
              [Admin auth placeholder]
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
