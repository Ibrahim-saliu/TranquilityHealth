/**
 * Contact — /contact
 *
 * Phase 0: Placeholder contact page with basic info.
 * TODO (future phase): Implement contact form with backend submission.
 * TODO (Phase 3): Connect form to API route with rate limiting and HIPAA-safe logging.
 */

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
      <p className="mt-4 text-lg text-gray-500">
        We're here to help. Reach out with questions or to learn more about our services.
      </p>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Contact info card */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General Inquiries</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span>📧</span>
              <span>hello@tranquilityhealth.com</span>
            </li>
            <li className="flex items-center gap-2">
              <span>📞</span>
              <span>(555) 000-0000</span>
            </li>
            <li className="flex items-center gap-2">
              <span>🕒</span>
              <span>Monday–Friday, 8 AM–6 PM</span>
            </li>
          </ul>
        </div>

        {/* Crisis info card */}
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-red-900 mb-4">Crisis & Emergency</h3>
          <p className="text-sm text-red-700 leading-relaxed">
            If you are in immediate danger or experiencing a mental health crisis,
            please call <strong>988</strong> (Suicide & Crisis Lifeline) or{" "}
            <strong>911</strong>.
          </p>
          <p className="mt-3 text-sm text-red-600">
            Tranquility Health is not an emergency service.
          </p>
        </div>
      </div>

      {/* Contact form placeholder */}
      <div className="mt-10 p-8 bg-gray-50 border border-gray-200 rounded-xl">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Send a Message</h3>
        <p className="text-gray-500 text-sm mb-6">
          Have a question? Fill out the form below and we'll get back to you within one business day.
        </p>
        <div className="space-y-4">
          {/* TODO (future phase): Implement actual form with react-hook-form + API submission */}
          {["Name", "Email", "Subject"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
              <div className="w-full h-10 bg-white border border-gray-200 rounded-lg" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <div className="w-full h-32 bg-white border border-gray-200 rounded-lg" />
          </div>
          <div className="pt-2">
            <button
              disabled
              className="px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-lg opacity-50 cursor-not-allowed text-sm"
            >
              Send Message (Coming Soon)
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-teal-50 rounded-xl border border-teal-100">
        <p className="text-teal-800 text-sm font-medium">
          📋 Phase 0 — Placeholder content. Contact form implementation coming in future phases.
        </p>
      </div>
    </div>
  );
}
