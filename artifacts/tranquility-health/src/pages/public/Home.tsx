/**
 * Home — public landing page (/).
 *
 * Entry point for the Tranquility Health marketing site.
 * Phase 0: placeholder with brand identity and navigation prompts.
 * TODO (future phase): Build full hero section, feature highlights, testimonials, CTAs.
 */

import { Link } from "wouter";
import { ROUTES } from "@/lib/config/routes";

export default function HomePage() {
  return (
    <div className="py-16 text-center">
      {/* Hero section placeholder */}
      <div className="max-w-3xl mx-auto">
        <span className="inline-block bg-teal-50 text-teal-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          Telehealth — Coming Soon
        </span>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Mental health care,{" "}
          <span className="text-teal-600">wherever you are.</span>
        </h1>
        <p className="mt-6 text-xl text-gray-500 leading-relaxed">
          Tranquility Health connects you with licensed therapists and
          psychiatric providers through a secure, private telehealth platform.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={ROUTES.public.requestAppointment}
            className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors text-lg"
          >
            Get Started →
          </Link>
          <Link
            href={ROUTES.public.services}
            className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-lg"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Feature highlights placeholder */}
      <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
        {[
          {
            title: "Secure & Private",
            description:
              "HIPAA-conscious infrastructure. Your health data stays yours.",
            icon: "🔒",
          },
          {
            title: "Licensed Providers",
            description:
              "Board-certified therapists and psychiatric NPs available.",
            icon: "🩺",
          },
          {
            title: "Flexible Scheduling",
            description:
              "Book sessions that fit your life — evenings and weekends available.",
            icon: "📅",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="p-6 bg-gray-50 rounded-xl border border-gray-100"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
          </div>
        ))}
      </div>

      <p className="mt-16 text-xs text-gray-400 italic">
        Phase 0 — Placeholder content. Full marketing copy coming in future phases.
      </p>
    </div>
  );
}
