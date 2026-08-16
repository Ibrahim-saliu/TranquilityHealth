import { Link } from "wouter";
import { ROUTES } from "@/lib/config/routes";
import { CtaBlock } from "@/components/public/CtaBlock";
import { PageHeader } from "@/components/public/PageHeader";
import { SectionWrapper } from "@/components/public/SectionWrapper";

const conditions = [
  {
    name: "Depression",
    description: "Persistent low mood, loss of energy, or difficulty finding pleasure in daily activities.",
    iconSrc: "/icons/icon-depression.png",
    gradient: "from-teal-500 to-teal-600",
  },
  {
    name: "Anxiety",
    description: "Excessive worry, nervousness, or fear that interferes with everyday life and relationships.",
    iconSrc: "/icons/icon-anxiety.png",
    gradient: "from-violet-500 to-violet-600",
  },
  {
    name: "Mood Disorders",
    description: "Conditions like bipolar disorder that cause significant shifts in mood, energy, and behavior.",
    iconSrc: "/icons/icon-mood-disorder.png",
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    name: "Sleep Disorders",
    description: "Chronic difficulty falling asleep, staying asleep, or getting restorative rest.",
    iconSrc: "/icons/icon-sleep.png",
    gradient: "from-indigo-600 to-slate-700",
  },
  {
    name: "Personality Disorders",
    description: "Enduring patterns of inner experience and behavior that differ markedly from cultural norms.",
    iconSrc: "/icons/icon-personality.png",
    gradient: "from-teal-400 to-teal-600",
  },
  {
    name: "Schizophrenia",
    description: "A complex condition affecting how a person thinks, feels, and perceives reality.",
    iconSrc: "/icons/icon-schizophrenia.png",
    gradient: "from-violet-600 to-indigo-700",
  },
];

export default function ServicesPage() {
  return (
    <div>
      <PageHeader
        title="Our Services"
        subtitle="Comprehensive mental health care delivered via telehealth, from initial evaluation through ongoing therapy and medication management."
        badge="Telehealth · Licensed in TX &amp; MD"
      />

      {/* Medication Management */}
      <SectionWrapper variant="slate">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          {/* Service card — Medication Management */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-300">
            <div className="flex items-start gap-5 mb-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white shadow-lg ring-1 ring-slate-100/80 flex items-center justify-center p-3">
                <img src="/icons/icon-medication.png" alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Medication Management</h2>
                <p className="mt-3 text-slate-600 leading-relaxed text-sm">
                  Our primary service: psychiatric evaluation and ongoing medication management delivered entirely via telehealth. Our psychiatric nurse practitioner works with you to find the right treatment plan, monitor your progress, and adjust medications as needed.
                </p>
                <div className="mt-4 p-4 bg-teal-50 rounded-xl border border-teal-100">
                  <p className="text-xs text-teal-700">
                    <span className="font-semibold">Good for:</span> Adults seeking psychiatric medication support for any of the conditions listed below.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden mb-6">
              <img src="/services-medication.png" alt="Medication management telehealth" className="w-full h-52 object-cover" />
            </div>

            {/* Conditions grid */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Conditions we treat</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {conditions.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-teal-200 hover:bg-teal-50/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white shadow-md ring-1 ring-slate-100/80 flex items-center justify-center p-1.5">
                      <img src={c.iconSrc} alt="" className="w-full h-full object-contain" />
                    </div>
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
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white shadow-lg ring-1 ring-slate-100/80 flex items-center justify-center p-3">
                <img src="/icons/icon-therapy.png" alt="" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">Psychotherapy</h2>
                <p className="mt-3 text-slate-600 leading-relaxed text-sm">
                  Individual counseling sessions with a licensed therapist via secure video call. We use evidence-based approaches tailored to your specific needs and goals, helping you build lasting coping skills and emotional resilience.
                </p>
                <div className="mt-5 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                  <p className="text-xs text-indigo-700">
                    <span className="font-semibold">Good for:</span> Adults seeking individual counseling and therapeutic support.
                  </p>
                </div>
                <div className="mt-5 rounded-xl overflow-hidden">
                  <img src="/services-therapy.png" alt="Psychotherapy session" className="w-full h-48 object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="brand" tight>
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
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
          <h2 className="text-3xl font-bold text-slate-900">Not sure which service is right for you?</h2>
          <p className="mt-4 text-slate-500 text-base leading-relaxed max-w-xl mx-auto">
            That's completely okay. In your request form, simply select "Not sure yet" and our care coordinator will help you figure out the best starting point during your intake call.
          </p>
          <Link
            href={ROUTES.public.requestAppointment}
            className="mt-7 inline-flex items-center px-7 py-3.5 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-sm"
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
