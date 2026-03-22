/**
 * Faq — /faq
 *
 * Phase 0: Placeholder FAQ page with common telehealth questions.
 * TODO (future phase): Fetch FAQ from CMS or admin config. Add search/filter.
 */

const faqs = [
  {
    question: "What is telehealth?",
    answer:
      "Telehealth allows you to meet with a licensed mental health provider via secure video call — from the comfort of your home or any private location.",
  },
  {
    question: "Is telehealth covered by insurance?",
    answer:
      "Many insurance plans now cover telehealth services. We work with several major insurers. Contact us to verify your specific coverage.",
  },
  {
    question: "How do I book an appointment?",
    answer:
      "You can request an appointment through our Request Appointment page. Our team will reach out within one business day to confirm your slot.",
  },
  {
    question: "Is my information kept private?",
    answer:
      "Yes. Tranquility Health is built on HIPAA-conscious infrastructure. All sessions are conducted over encrypted connections and your data is never sold.",
  },
  {
    question: "What if I'm in crisis?",
    answer:
      "If you are experiencing a mental health emergency, please call 988 (Suicide & Crisis Lifeline) or 911. Tranquility Health also offers same-day crisis appointments when available.",
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
      <p className="mt-4 text-lg text-gray-500">
        Everything you need to know about getting started.
      </p>

      <div className="mt-10 space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
            <p className="mt-2 text-gray-600 leading-relaxed text-sm">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 p-6 bg-teal-50 rounded-xl border border-teal-100">
        <p className="text-teal-800 text-sm font-medium">
          📋 Phase 0 — Placeholder content. Dynamic FAQ management coming in future phases.
        </p>
      </div>
    </div>
  );
}
