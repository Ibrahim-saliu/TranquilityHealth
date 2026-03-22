import { Link } from "wouter";
import { ROUTES } from "@/lib/config/routes";
import { CtaBlock } from "@/components/public/CtaBlock";

const features = [
  {
    title: "Video Appointments",
    description: "Secure, HIPAA-conscious video sessions with licensed clinicians from the comfort of your home.",
  },
  {
    title: "Anxiety & Depression",
    description: "Evidence-based therapy for anxiety, depression, and mood disorders tailored to your needs.",
  },
  {
    title: "ADHD Treatment",
    description: "Comprehensive evaluation and management for ADHD — therapy, coaching, and medication when appropriate.",
  },
  {
    title: "Medication Management",
    description: "Psychiatric medication services with careful monitoring and thoughtful prescribing practices.",
  },
  {
    title: "New Patient Friendly",
    description: "First time seeking mental health care? We'll walk you through every step of the process.",
  },
  {
    title: "Flexible Scheduling",
    description: "Evening and weekend availability designed to work around your schedule, not the other way around.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-50 via-white to-blue-50 py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
              Telehealth · No commute required
            </span>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Mental health care you can access <span className="text-teal-600">anywhere</span>
            </h1>
            <p className="mt-6 text-xl text-gray-500 leading-relaxed">
              Tranquility Health provides compassionate, evidence-based treatment for anxiety, depression, and ADHD — via secure video appointments that fit your life.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href={ROUTES.public.requestAppointment}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors text-base"
              >
                Request Appointment
              </Link>
              <Link
                href={ROUTES.public.services}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-gray-700 font-semibold rounded-lg border border-gray-200 hover:border-teal-300 hover:text-teal-700 transition-colors text-base"
              >
                Learn About Services
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="w-96 h-80 bg-gradient-to-br from-teal-100 to-blue-100 rounded-3xl flex items-center justify-center shadow-lg">
              <div className="text-center p-8">
                <p className="text-6xl mb-4">🌿</p>
                <p className="text-teal-800 font-semibold text-lg">Calm, focused care</p>
                <p className="text-teal-600 text-sm mt-1">Wherever you are</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-teal-700 py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-6 text-teal-100 text-sm font-medium">
          <span>✓ Licensed Clinicians</span>
          <span>✓ HIPAA-Conscious Platform</span>
          <span>✓ No In-Person Visits</span>
          <span>✓ Evening &amp; Weekend Hours</span>
          <span>✓ New Patients Welcome</span>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why patients choose Tranquility Health</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              We combine clinical expertise with technology to make quality mental health care genuinely accessible.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Submit a request",
                body: "Fill out our short appointment request form. No account needed — just your contact info and a bit about what you're looking for.",
              },
              {
                step: "2",
                title: "We reach out",
                body: "Our care coordinator will contact you within one business day to schedule your first appointment and answer any questions.",
              },
              {
                step: "3",
                title: "Meet your clinician",
                body: "Attend your video appointment from anywhere. Your clinician will work with you to build a personalized care plan.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
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
