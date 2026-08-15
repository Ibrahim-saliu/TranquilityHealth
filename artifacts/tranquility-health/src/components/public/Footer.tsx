import { Link } from "wouter";
import { ROUTES } from "@/lib/config/routes";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">Tranquility Health</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Compassionate telehealth care for anxiety, depression, mood disorders, and more. Accessible from wherever you are.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Telehealth · Insurance accepted · HSA/FSA welcome
            </p>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { label: "About Us", href: ROUTES.public.about },
                { label: "Services", href: ROUTES.public.services },
                { label: "Office Hours", href: ROUTES.public.hours },
                { label: "FAQ", href: ROUTES.public.faq },
                { label: "Contact", href: ROUTES.public.contact },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">Get Started</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href={ROUTES.public.requestAppointment}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Book an Appointment
                </Link>
              </li>
              <li>
                <Link
                  href={ROUTES.public.contact}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-slate-800/80 rounded-xl border border-slate-700/60">
              <p className="text-xs text-slate-400 leading-relaxed">
                If you are in a mental health emergency, call <strong className="text-slate-300">988</strong> (Suicide &amp; Crisis Lifeline) or <strong className="text-slate-300">911</strong>. Tranquility Health is not an emergency service.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} Tranquility Health. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link href={ROUTES.public.privacyPolicy} className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href={ROUTES.public.termsOfService} className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href={ROUTES.public.hipaaNotice} className="hover:text-slate-300 transition-colors">HIPAA Notice</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
