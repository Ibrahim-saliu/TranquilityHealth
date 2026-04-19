import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ROUTES } from "@/lib/config/routes";

const navLinks = [
  { label: "Home", href: ROUTES.public.home },
  { label: "Services", href: ROUTES.public.services },
  { label: "About", href: ROUTES.public.about },
  { label: "Contact", href: ROUTES.public.contact },
];

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href={ROUTES.public.home} className="flex items-center gap-2">
          <img src="/icon.png" alt="Tranquility Health" className="w-8 h-8 rounded-lg object-cover" />
          <span className="bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent font-bold text-xl tracking-tight">
            Tranquility Health
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                location === href
                  ? "text-teal-600"
                  : "text-slate-600 hover:text-teal-600"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href={ROUTES.public.requestAppointment}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-teal-600 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            Book Appointment
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3 shadow-lg">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="block text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors py-1"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href={ROUTES.public.requestAppointment}
            className="block text-sm font-semibold text-teal-600 hover:text-teal-700 pt-2 border-t border-slate-100"
            onClick={() => setMobileOpen(false)}
          >
            Book Appointment →
          </Link>
        </div>
      )}
    </header>
  );
}
