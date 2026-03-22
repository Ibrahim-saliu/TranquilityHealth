import { Link } from "wouter";
import { ROUTES } from "@/lib/config/routes";
import { CtaBlock } from "@/components/public/CtaBlock";

const services = [
  {
    icon: "💊",
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
    icon: "💬",
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
      <section className="bg-gradient-to-br from-teal-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900">Our Services</h1>
          <p className="mt-4 text-xl text-gray-500 leading-relaxed max-w-2xl">
            Comprehensive mental health care delivered via telehealth — from initial evaluation through ongoing therapy and medication management.
          </p>
        </div>
      </section>

      {/* Service cards */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {services.map((service) => (
            <div key={service.title} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-5">
                <span className="text-4xl">{service.icon}</span>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{service.title}</h2>
                  <p className="mt-3 text-gray-600 leading-relaxed text-sm">{service.description}</p>
                  {service.conditions && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Conditions treated</p>
                      <div className="flex flex-wrap gap-2">
                        {service.conditions.map((c) => (
                          <span key={c} className="inline-block bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1 rounded-full border border-teal-100">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 p-3 bg-teal-50 rounded-lg">
                    <p className="text-xs text-teal-700">
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
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-blue-900 mb-2">All services delivered via telehealth</h3>
          <p className="text-blue-700 text-sm leading-relaxed">
            All Tranquility Health services are conducted over secure, HIPAA-conscious video calls. You'll receive a link before your appointment — no downloads required for most devices. You just need a private space and a reliable internet connection.
          </p>
        </div>
      </section>

      {/* Not sure what you need */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900">Not sure which service is right for you?</h2>
          <p className="mt-3 text-gray-500 text-base leading-relaxed max-w-xl mx-auto">
            That's completely okay. In your request form, simply select "Not sure" and our care coordinator will help you figure out the best starting point during your intake call.
          </p>
          <Link
            href={ROUTES.public.requestAppointment}
            className="mt-6 inline-flex items-center px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors text-sm"
          >
            Request Appointment
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4">
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
