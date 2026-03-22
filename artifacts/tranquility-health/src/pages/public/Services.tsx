/**
 * Services — /services
 *
 * Phase 0: Placeholder page listing service offerings.
 * TODO (future phase): Add detailed service descriptions, pricing, provider types.
 */

const services = [
  {
    title: "Individual Therapy",
    description: "One-on-one sessions with a licensed therapist via secure video.",
    icon: "💬",
  },
  {
    title: "Psychiatric Evaluation",
    description: "Comprehensive mental health assessments with a licensed psychiatric provider.",
    icon: "🧠",
  },
  {
    title: "Medication Management",
    description: "Ongoing support and monitoring for psychiatric medications.",
    icon: "💊",
  },
  {
    title: "Crisis Support",
    description: "Same-day and next-day appointments available for urgent needs.",
    icon: "🆘",
  },
];

export default function ServicesPage() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-gray-900">Our Services</h1>
      <p className="mt-4 text-lg text-gray-500">
        Comprehensive mental health care delivered via telehealth.
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {services.map((service) => (
          <div
            key={service.title}
            className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-4xl mb-4">{service.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
            <p className="mt-2 text-gray-500 text-sm leading-relaxed">{service.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 bg-teal-50 rounded-xl border border-teal-100">
        <p className="text-teal-800 text-sm font-medium">
          📋 Phase 0 — Placeholder content. Detailed service pages and pricing coming in future phases.
        </p>
      </div>
    </div>
  );
}
