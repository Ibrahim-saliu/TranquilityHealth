import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ROUTES } from "@/lib/config/routes";

const navLinks = [
  { label: "Home", href: ROUTES.public.home },
  { label: "About", href: ROUTES.public.about },
  { label: "Services", href: ROUTES.public.services },
  { label: "Hours", href: ROUTES.public.hours },
  { label: "FAQ", href: ROUTES.public.faq },
  { label: "Contact", href: ROUTES.public.contact },
];

export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href={ROUTES.public.home} className="flex items-center gap-2">
          <span className="text-teal-700 font-bold text-xl tracking-tight">
            Tranquility Health
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition-colors ${
                location === href
                  ? "text-teal-700"
                  : "text-gray-600 hover:text-teal-600"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href={ROUTES.public.requestAppointment}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            Book Appointment
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
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
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="block text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors py-1"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href={ROUTES.public.requestAppointment}
            className="block text-sm font-semibold text-teal-700 hover:text-teal-800 pt-2 border-t border-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            Book Appointment →
          </Link>
        </div>
      )}
    </header>
  );
}
