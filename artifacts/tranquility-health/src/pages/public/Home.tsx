import { Link } from "wouter";
import { ROUTES } from "@/lib/config/routes";
import { CtaBlock } from "@/components/public/CtaBlock";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
    ),
    gradient: "from-teal-500 to-teal-600",
    title: "Video Appointments",
    description: "Secure, HIPAA-conscious video sessions with licensed clinicians from the comfort of your home.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    gradient: "from-indigo-500 to-indigo-600",
    title: "Medication Management",
    description: "Expert psychiatric medication evaluation and ongoing management for depression, anxiety, mood disorders, and more.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    gradient: "from-violet-500 to-violet-600",
    title: "Psychotherapy",
    description: "Individual counseling sessions using evidence-based approaches tailored to your needs and goals.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    gradient: "from-teal-400 to-indigo-500",
    title: "Sleep & Mood Disorders",
    description: "Specialized care for sleep disorders, mood disorders, personality disorders, and schizophrenia.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-600",
    title: "New Patient Friendly",
    description: "First time seeking mental health care? We'll walk you through every step of the process.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    gradient: "from-indigo-400 to-violet-600",
    title: "Flexible Scheduling",
    description: "Evening and weekend availability designed to work around your schedule, not the other way around.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-indigo-900 py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-teal-400 blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-indigo-500 blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-white/10 border border-white/20 text-teal-200 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-5 backdrop-blur-sm">
              Telehealth · No commute required
            </span>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Mental health care you can access{" "}
              <span className="bg-gradient-to-r from-teal-300 to-indigo-300 bg-clip-text text-transparent">
                anywhere
              </span>
            </h1>
            <p className="mt-6 text-xl text-slate-300 leading-relaxed">
              Tranquility Health provides compassionate, evidence-based medication management and psychotherapy for depression, anxiety, mood disorders, and more — via secure video appointments that fit your life.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href={ROUTES.public.requestAppointment}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-teal-400 to-teal-500 text-white font-semibold rounded-xl hover:from-teal-500 hover:to-teal-600 transition-all shadow-lg hover:shadow-teal-500/30 text-base"
              >
                Request Appointment
              </Link>
              <Link
                href={ROUTES.public.services}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-white/10 border border-white/25 text-white font-semibold rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm text-base"
              >
                Learn About Services
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/30 to-indigo-500/30 rounded-3xl blur-xl scale-110" />
              <img
                src="/hero.png"
                alt="Person relaxing at home during a telehealth session"
                className="relative w-96 h-80 object-cover rounded-3xl shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-gradient-to-r from-teal-600 to-indigo-700 py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-6 text-white/90 text-sm font-medium">
          <span>✓ Licensed Clinicians</span>
          <span>✓ HIPAA-Conscious Platform</span>
          <span>✓ No In-Person Visits</span>
          <span>✓ Evening &amp; Weekend Hours</span>
          <span>✓ New Patients Welcome</span>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Why patients choose Tranquility Health</h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              We combine clinical expertise with technology to make quality mental health care genuinely accessible.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-4 shadow-sm`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
            <p className="mt-3 text-lg text-slate-500">Getting started takes less than 3 minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                gradient: "from-teal-500 to-teal-600",
                title: "Submit a request",
                body: "Fill out our short appointment request form. No account needed — just your contact info and a bit about what you're looking for.",
              },
              {
                step: "2",
                gradient: "from-teal-500 to-indigo-600",
                title: "We reach out",
                body: "Our care coordinator will contact you within one business day to schedule your first appointment and answer any questions.",
              },
              {
                step: "3",
                gradient: "from-indigo-500 to-violet-600",
                title: "Meet your clinician",
                body: "Attend your video appointment from anywhere. Your clinician will work with you to build a personalized care plan.",
              },
            ].map(({ step, gradient, title, body }) => (
              <div key={step} className="flex gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className={`flex-shrink-0 w-11 h-11 bg-gradient-to-br ${gradient} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm`}>
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-base mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <CtaBlock
            heading="Ready to take the first step?"
            subtext="Requesting an appointment takes less than 3 minutes. No commitment, no account required."
          />
        </div>
      </section>
    </div>
  );
}
