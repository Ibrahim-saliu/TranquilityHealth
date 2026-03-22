/**
 * Footer — public site footer.
 *
 * Displays brand, navigation links, and a compliance notice.
 * Future phases will add privacy policy, terms of service, and HIPAA notices.
 */

import { Link } from "wouter";
import { ROUTES } from "@/lib/config/routes";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand / Description */}
          <div>
            <span className="text-white font-bold text-lg">
              Tranquility Health
            </span>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Compassionate telehealth care — accessible from wherever you are.
            </p>
            {/* TODO: Add social links / contact info in future phase */}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { label: "About Us", href: ROUTES.public.about },
                { label: "Services", href: ROUTES.public.services },
                { label: "Hours", href: ROUTES.public.hours },
                { label: "FAQ", href: ROUTES.public.faq },
                { label: "Contact", href: ROUTES.public.contact },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Patient Portal */}
          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
              Patient Portal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={ROUTES.public.requestAppointment}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Request Appointment
                </Link>
              </li>
              {/* TODO (Phase 3): Add Sign In link */}
              <li>
                <span className="text-sm text-gray-600 italic">
                  Patient sign-in (coming soon)
                </span>
              </li>
            </ul>

            {/* HIPAA Notice placeholder */}
            <div className="mt-6 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400">
                🔒 HIPAA-conscious platform. Your health information is
                protected.
              </p>
              {/* TODO (Phase compliance): Add Privacy Policy and BAA links */}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {currentYear} Tranquility Health. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            {/* TODO: Add links to actual policy pages in future phases */}
            <span className="hover:text-gray-300 cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-gray-300 cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-gray-300 cursor-pointer">
              HIPAA Notice
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
