import { Link } from "wouter";
import { Mail, Phone, Clock } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";

const contactIcons = [
  {
    Icon: Mail,
    gradient: "from-teal-500 to-teal-600",
    label: "Email",
    content: (
      <a href="mailto:hello@tranquilityhealth.com" className="text-teal-600 hover:text-teal-700 hover:underline">
        hello@tranquilityhealth.com
      </a>
    ),
  },
  {
    Icon: Phone,
    gradient: "from-indigo-500 to-indigo-600",
    label: "Phone",
    content: (
      <>
        <p className="text-slate-600">(555) 000-0000</p>
        <p className="text-xs text-slate-400 mt-0.5">Mon–Thu 5–9 PM, Fri 8 AM–7 PM, Sat 8 AM–4 PM CST</p>
      </>
    ),
  },
  {
    Icon: Clock,
    gradient: "from-violet-500 to-violet-600",
    label: "Response time",
    content: <p className="text-slate-600">We typically respond within one business day.</p>,
  },
];

export default function ContactPage() {
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
            Get in touch
          </span>
          <h1 className="text-4xl font-bold text-white">Contact Us</h1>
          <p className="mt-4 text-xl text-slate-300 leading-relaxed">
            We're here to help. Reach out with questions or to learn more about our services.
          </p>
        </div>
      </section>

      <section className="py-14 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-5">General Inquiries</h3>
              <ul className="space-y-4 text-sm text-slate-600">
                {contactIcons.map(({ Icon, gradient, label, content }) => (
                  <li key={label} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-9 h-9 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mt-0.5 shadow-sm`}>
                      <Icon className="w-4 h-4 text-white" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 mb-0.5">{label}</p>
                      {content}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Ready to book?</h3>
              <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                The fastest way to connect with our team is by submitting an appointment request. Our care coordinator will reach out within one business day to confirm your slot.
              </p>
              <Link
                href={ROUTES.public.requestAppointment}
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-teal-600 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
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
              <ul className="mt-3 space-y-2.5 text-sm text-red-800">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span><strong>988</strong> — Suicide &amp; Crisis Lifeline (call or text)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span><strong>911</strong> — Life-threatening emergencies</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span><strong>Crisis Text Line</strong> — Text HOME to 741741</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-red-600 font-semibold">
                Tranquility Health is not an emergency service.
              </p>
            </div>

            {/* FAQ link */}
            <div className="bg-gradient-to-br from-teal-50 to-indigo-50 border border-teal-100 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-2">Have a question?</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Our FAQ page covers most common questions about services, insurance, scheduling, and privacy.
              </p>
              <Link
                href={ROUTES.public.faq}
                className="text-sm font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
              >
                Browse FAQ
                <span aria-hidden>→</span>
              </Link>
            </div>

            {/* HIPAA note */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-600">Privacy Notice:</span> Please do not share protected health information (PHI) in any contact form or email. If you need to discuss your health details, please do so during your scheduled appointment over our secure video platform.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
