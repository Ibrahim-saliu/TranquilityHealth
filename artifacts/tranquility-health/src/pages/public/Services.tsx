import { Link } from "wouter";
import { Pill, Brain } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";
import { CtaBlock } from "@/components/public/CtaBlock";

const services = [
  {
    Icon: Pill,
    gradient: "from-teal-500 to-teal-600",
    bgLight: "bg-teal-50",
    borderLight: "border-teal-100",
    tagBg: "bg-teal-50",
    tagText: "text-teal-700",
    tagBorder: "border-teal-200",
    goodBg: "bg-teal-50",
    goodText: "text-teal-700",
    title: "Medication Management",
    description: "Our primary service — psychiatric evaluation and ongoing medication management delivered entirely via telehealth. Our psychiatric nurse practitioner works with you to find the right treatment plan, monitor your progress, and adjust medications as needed.",
    conditions: [
      "Depression",
      "Anxiety",
      "Mood Disorders",
      "Sleep Disorders",
      "Personality Disorders",
      "Schizophrenia",
    ],
    who: "Adults seeking psychiatric medication support for any of the conditions listed above.",
  },
  {
    Icon: Brain,
    gradient: "from-indigo-500 to-violet-600",
    bgLight: "bg-indigo-50",
    borderLight: "border-indigo-100",
    tagBg: "bg-indigo-50",
    tagText: "text-indigo-700",
    tagBorder: "border-indigo-200",
    goodBg: "bg-indigo-50",
    goodText: "text-indigo-700",
    title: "Psychotherapy",
    description: "Individual counseling sessions with a licensed therapist via secure video call. We use evidence-based approaches tailored to your specific needs and goals, helping you build lasting coping skills and emotional resilience.",
    conditions: null,
    who: "Adults seeking individual counseling and therapeutic support.",
  },
];

export default function ServicesPage() {
  return (
    <div>
      {/* Header */}
      <section className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-indigo-900 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-400 blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-500 blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <span className="inline-block bg-white/10 border border-white/20 text-teal-200 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-5">
            Telehealth · Texas-based
          </span>
          <h1 className="text-4xl font-bold text-white">Our Services</h1>
          <p className="mt-4 text-xl text-slate-300 leading-relaxed max-w-2xl">
            Comprehensive mental health care delivered via telehealth — from initial evaluation through ongoing therapy and medication management.
          </p>
        </div>
      </section>

      {/* Service cards */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto space-y-8">
          {services.map((service) => (
            <div key={service.title} className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all">
              <div className="flex items-start gap-5">
                <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center shadow-md`}>
                  <service.Icon className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900">{service.title}</h2>
                  <p className="mt-3 text-slate-600 leading-relaxed text-sm">{service.description}</p>
                  {service.conditions && (
                    <div className="mt-5">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Conditions treated</p>
                      <div className="flex flex-wrap gap-2">
                        {service.conditions.map((c) => (
                          <span key={c} className={`inline-block ${service.tagBg} ${service.tagText} text-xs font-medium px-3 py-1.5 rounded-full border ${service.tagBorder}`}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={`mt-5 p-4 ${service.goodBg} rounded-xl`}>
                    <p className={`text-xs ${service.goodText}`}>
                      <span className="font-semibold">Good for:</span> {service.who}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Telehealth note */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-50 to-teal-50 border border-indigo-100 rounded-2xl p-7">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">All services delivered via telehealth</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                All Tranquility Health services are conducted over secure, HIPAA-conscious video calls. You'll receive a link before your appointment — no downloads required for most devices. You just need a private space and a reliable internet connection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Not sure what you need */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
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
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <CtaBlock
            heading="Ready to get started?"
            subtext="Request an appointment and our team will reach out within one business day."
          />
        </div>
      </section>
    </div>
  );
}
