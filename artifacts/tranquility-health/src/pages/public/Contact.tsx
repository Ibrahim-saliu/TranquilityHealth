import { Link } from "wouter";
import { Mail, Phone, Clock } from "lucide-react";
import { ROUTES } from "@/lib/config/routes";
import { PageHeader } from "@/components/public/PageHeader";
import { SectionWrapper } from "@/components/public/SectionWrapper";

const schedule = [
  { day: "Monday", hours: "5:00 PM – 9:00 PM", closed: false },
  { day: "Tuesday", hours: "5:00 PM – 9:00 PM", closed: false },
  { day: "Wednesday", hours: "5:00 PM – 9:00 PM", closed: false },
  { day: "Thursday", hours: "5:00 PM – 9:00 PM", closed: false },
  { day: "Friday", hours: "8:00 AM – 1:00 PM, 3:00 PM – 7:00 PM", closed: false },
  { day: "Saturday", hours: "8:00 AM – 4:00 PM", closed: false },
  { day: "Sunday", hours: "Closed", closed: true },
];

const contactItems = [
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
      <PageHeader
        title="Contact Us"
        subtitle="We're here to help. Reach out with questions or to learn more about our services."
        badge="Get in touch"
      />

      <SectionWrapper variant="slate">
        <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          {/* Contact info */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-5">General Inquiries</h3>
              <ul className="space-y-4 text-sm text-slate-600">
                {contactItems.map(({ Icon, gradient, label, content }) => (
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
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Mental Health Crisis</h3>
              <p className="text-sm text-red-700 leading-relaxed">
                If you are in immediate danger or experiencing a mental health crisis, please call:
              </p>
              <ul className="mt-3 space-y-2.5 text-sm text-red-800">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span><strong>988</strong>: Suicide &amp; Crisis Lifeline (call or text)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span><strong>911</strong>: Life-threatening emergencies</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span><strong>Crisis Text Line</strong>: Text HOME to 741741</span>
                </li>
              </ul>
              <p className="mt-4 text-xs text-red-600 font-semibold">
                Tranquility Health is not an emergency service.
              </p>
            </div>

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

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-xs text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-600">Privacy Notice:</span> Please do not share protected health information (PHI) in any contact form or email. If you need to discuss your health details, please do so during your scheduled appointment over our secure video platform.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Office Hours */}
      <SectionWrapper variant="white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Office Hours</h2>
          <p className="text-slate-500 text-sm mb-6">All times are Central Time (CST). Hours may vary on federal holidays.</p>
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-teal-600 to-indigo-700 text-white">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Day</th>
                  <th className="text-right px-6 py-4 font-semibold">Available Hours (CST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {schedule.map(({ day, hours, closed }) => (
                  <tr
                    key={day}
                    className={`${closed ? "bg-slate-50" : "hover:bg-teal-50"} transition-colors`}
                  >
                    <td className={`px-6 py-4 font-medium ${closed ? "text-slate-400" : "text-slate-900"}`}>
                      {day}
                    </td>
                    <td className={`px-6 py-4 text-right ${closed ? "text-slate-400" : "text-slate-700"}`}>
                      {closed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 uppercase tracking-wider">
                          Closed
                        </span>
                      ) : (
                        hours
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 text-sm font-semibold mb-1">Appointment Only</p>
            <p className="text-amber-700 text-sm leading-relaxed">
              Tranquility Health is an appointment-only telehealth practice. We do not offer walk-in slots. Request an appointment online and our care coordinator will confirm your time within one business day.
            </p>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
