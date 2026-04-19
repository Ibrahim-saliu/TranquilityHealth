import { Link } from "wouter";
import { Brain } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";
import { CtaBlock } from "@/components/public/CtaBlock";
import { PageHeader } from "@/components/public/PageHeader";
import { SectionWrapper } from "@/components/public/SectionWrapper";

const conditions = [
  {
    name: "Depression",
    description: "Persistent low mood, loss of energy, or difficulty finding pleasure in daily activities.",
    icon: "🌧",
  },
  {
    name: "Anxiety",
    description: "Excessive worry, nervousness, or fear that interferes with everyday life and relationships.",
    icon: "⚡",
  },
  {
    name: "Mood Disorders",
    description: "Conditions like bipolar disorder that cause significant shifts in mood, energy, and behavior.",
    icon: "🔄",
  },
  {
    name: "Sleep Disorders",
    description: "Chronic difficulty falling asleep, staying asleep, or getting restorative rest.",
    icon: "🌙",
  },
  {
    name: "Personality Disorders",
    description: "Enduring patterns of inner experience and behavior that differ markedly from cultural norms.",
    icon: "🧩",
  },
  {
    name: "Schizophrenia",
    description: "A complex condition affecting how a person thinks, feels, and perceives reality.",
    icon: "🔬",
  },
];

export default function ServicesPage() {
  return (
    <div>
      <PageHeader
        title="Our Services"
        subtitle="Comprehensive mental health care delivered via telehealth, from initial evaluation through ongoing therapy and medication management."
        badge="Telehealth · Texas-based"
      />

      {/* Medication Management */}
      <SectionWrapper variant="slate">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          {/* Service card — Medication Management */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-start gap-5 mb-6">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Medication Management</h2>
                <p className="mt-3 text-slate-600 leading-relaxed text-sm">
                  Our primary service: psychiatric evaluation and ongoing medication management delivered entirely via telehealth. Our psychiatric nurse practitioner works with you to find the right treatment plan, monitor your progress, and adjust medications as needed.
                </p>
                <div className="mt-4 p-4 bg-teal-50 rounded-xl">
                  <p className="text-xs text-teal-700">
                    <span className="font-semibold">Good for:</span> Adults seeking psychiatric medication support for any of the conditions listed below.
                  </p>
                </div>
              </div>
            </div>

            {/* Conditions grid */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Conditions we treat</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {conditions.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-teal-200 hover:bg-teal-50 transition-all"
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">{c.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{c.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service card — Psychotherapy */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-md">
                <Brain className="w-7 h-7 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Psychotherapy</h2>
                <p className="mt-3 text-slate-600 leading-relaxed text-sm">
                  Individual counseling sessions with a licensed therapist via secure video call. We use evidence-based approaches tailored to your specific needs and goals, helping you build lasting coping skills and emotional resilience.
                </p>
                <div className="mt-5 p-4 bg-indigo-50 rounded-xl">
                  <p className="text-xs text-indigo-700">
                    <span className="font-semibold">Good for:</span> Adults seeking individual counseling and therapeutic support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="white" tight>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-indigo-50 to-teal-50 border border-indigo-100 rounded-2xl p-7">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">All services delivered via telehealth</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  All Tranquility Health services are conducted over secure, HIPAA-conscious video calls. You'll receive a link before your appointment. No downloads required for most devices. You just need a private space and a reliable internet connection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Not sure which service is right for you?</h2>
          <p className="mt-3 text-slate-500 text-base leading-relaxed max-w-xl mx-auto">
            That's completely okay. In your request form, simply select "Not sure yet" and our care coordinator will help you figure out the best starting point during your intake call.
          </p>
          <Link
            href={ROUTES.public.requestAppointment}
            className="mt-6 inline-flex items-center px-7 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-sm"
          >
            Request Appointment
          </Link>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="slate" tight>
        <div className="max-w-4xl mx-auto px-4">
          <CtaBlock
            heading="Ready to get started?"
            subtext="Request an appointment and our team will reach out within one business day."
          />
        </div>
      </SectionWrapper>
    </div>
  );
}
