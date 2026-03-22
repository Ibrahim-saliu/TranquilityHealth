import { Link } from "wouter";
import { ROUTES } from "@/lib/config/routes";
import { CtaBlock } from "@/components/public/CtaBlock";

const services = [
  {
    icon: "💬",
    title: "Individual Therapy",
    description: "One-on-one sessions with a licensed therapist via secure video. We use evidence-based approaches including CBT and DBT to address anxiety, depression, life stressors, and relationship challenges.",
    who: "Adults 18+ dealing with anxiety, depression, OCD, life transitions, or relationship challenges.",
  },
  {
    icon: "🧠",
    title: "Psychiatric Evaluation",
    description: "A thorough initial evaluation with a psychiatric nurse practitioner to understand your symptoms, history, and goals. This typically takes 60 minutes and results in a personalized care plan.",
    who: "Anyone seeking a professional mental health diagnosis or exploring whether medication may help.",
  },
  {
    icon: "💊",
    title: "Medication Management",
    description: "Ongoing psychiatric care for patients already on or starting psychiatric medication. Includes regular follow-up appointments to monitor effectiveness and adjust as needed.",
    who: "Existing patients or those referred from a prior evaluation who need ongoing medication oversight.",
  },
  {
    icon: "🎯",
    title: "ADHD Assessment & Treatment",
    description: "Comprehensive ADHD evaluation for adults and adolescents, followed by a personalized treatment plan that may include therapy, behavioral strategies, and medication management.",
    who: "Adults and adolescents (16+) with suspected or previously diagnosed ADHD seeking support.",
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
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{service.title}</h2>
                  <p className="mt-3 text-gray-600 leading-relaxed text-sm">{service.description}</p>
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
