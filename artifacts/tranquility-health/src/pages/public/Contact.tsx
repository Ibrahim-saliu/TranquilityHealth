import { Link } from "wouter";
import { Mail, Phone, Clock } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";

export default function ContactPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-teal-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900">Contact Us</h1>
          <p className="mt-4 text-xl text-gray-500 leading-relaxed">
            We're here to help. Reach out with questions or to learn more about our services.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">General Inquiries</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center mt-0.5">
                    <Mail className="w-4 h-4 text-teal-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Email</p>
                    <a href="mailto:hello@tranquilityhealth.com" className="text-teal-600 hover:underline">
                      hello@tranquilityhealth.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center mt-0.5">
                    <Phone className="w-4 h-4 text-teal-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Phone</p>
                    <p className="text-gray-500">(555) 000-0000</p>
                    <p className="text-xs text-gray-400 mt-0.5">Mon–Thu 5–9 PM, Fri 8 AM–7 PM, Sat 8 AM–4 PM CST</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center mt-0.5">
                    <Clock className="w-4 h-4 text-teal-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Response time</p>
                    <p className="text-gray-500">We typically respond within one business day.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ready to book?</h3>
              <p className="text-sm text-gray-500 mb-4">
                The fastest way to connect with our team is by submitting an appointment request. Our care coordinator will reach out within one business day to confirm your slot.
              </p>
              <Link
                href={ROUTES.public.requestAppointment}
                className="inline-flex items-center px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
              >
                Request Appointment
              </Link>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Crisis info */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Mental Health Crisis</h3>
              <p className="text-sm text-red-700 leading-relaxed">
                If you are in immediate danger or experiencing a mental health crisis, please call:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-red-800">
                <li><strong>988</strong> — Suicide &amp; Crisis Lifeline (call or text)</li>
                <li><strong>911</strong> — Life-threatening emergencies</li>
                <li><strong>Crisis Text Line</strong> — Text HOME to 741741</li>
              </ul>
              <p className="mt-4 text-xs text-red-600 font-medium">
                Tranquility Health is not an emergency service.
              </p>
            </div>

            {/* FAQ link */}
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-teal-900 mb-2">Have a question?</h3>
              <p className="text-sm text-teal-700 mb-3">
                Our FAQ page covers most common questions about services, insurance, scheduling, and privacy.
              </p>
              <Link
                href={ROUTES.public.faq}
                className="text-sm font-semibold text-teal-700 hover:text-teal-900"
              >
                Browse FAQ →
              </Link>
            </div>

            {/* HIPAA note */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <p className="text-xs text-gray-500 leading-relaxed">
                <span className="font-semibold">Privacy Notice:</span> Please do not share protected health information (PHI) in any contact form or email. If you need to discuss your health details, please do so during your scheduled appointment over our secure video platform.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
