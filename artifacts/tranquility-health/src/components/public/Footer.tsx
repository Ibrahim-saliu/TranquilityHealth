import { Link } from "wouter";
import { ROUTES } from "@/lib/config/routes";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <span className="text-white font-bold text-lg">Tranquility Health</span>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Compassionate telehealth care for anxiety, depression, and ADHD — accessible from wherever you are.
            </p>
            <p className="mt-3 text-xs text-gray-500">
              Texas telehealth · Cash pay · No insurance required
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
                  <Link href={href} className="text-sm text-gray-400 hover:text-white transition-colors">
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
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Book an Appointment
                </Link>
              </li>
              <li>
                <span className="text-sm text-gray-600 italic">Patient portal coming soon</span>
              </li>
            </ul>

            <div className="mt-6 p-3 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400">
                {/* TODO (legal): replace with reviewed crisis disclaimer before launch */}
                If you are in a mental health emergency, call <strong className="text-gray-300">988</strong> (Crisis Lifeline) or <strong className="text-gray-300">911</strong>. Tranquility Health is not an emergency service.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {currentYear} Tranquility Health. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>HIPAA Notice</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
