import { CtaBlock } from "@/components/public/CtaBlock";
import { PageHeader } from "@/components/public/PageHeader";
import { SectionWrapper } from "@/components/public/SectionWrapper";

const schedule = [
  { day: "Monday", hours: "5:00 PM – 9:00 PM" },
  { day: "Tuesday", hours: "5:00 PM – 9:00 PM" },
  { day: "Wednesday", hours: "5:00 PM – 9:00 PM" },
  { day: "Thursday", hours: "5:00 PM – 9:00 PM" },
  { day: "Friday", hours: "8:00 AM – 1:00 PM, 3:00 PM – 7:00 PM" },
  { day: "Saturday", hours: "8:00 AM – 4:00 PM" },
  { day: "Sunday", hours: "Closed" },
];

export default function HoursPage() {
  return (
    <div>
      <PageHeader
        title="Office Hours"
        subtitle="Our schedule is designed around working adults, with evenings, Fridays, and Saturdays available."
        badge="Central Time (CST)"
      />

      <SectionWrapper variant="warm">
        <div className="max-w-3xl mx-auto px-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-md">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-teal-600 to-indigo-700 text-white">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Day</th>
                  <th className="text-right px-6 py-4 font-semibold">Available Hours (CST)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {schedule.map(({ day, hours }) => {
                  const closed = hours === "Closed";
                  return (
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
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-slate-400 italic">
            All times are Central Time (CST). Hours may vary on federal holidays.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="amber" tight>
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all duration-200">
            <p className="text-amber-800 text-sm font-semibold mb-1">Holiday Schedule</p>
            <p className="text-amber-700 text-sm leading-relaxed">
              Hours may vary on holidays. We post any schedule changes on this page at least 48 hours in advance. When in doubt, contact us at the number listed on our Contact page.
            </p>
          </div>
          <div className="p-5 bg-teal-50 border border-teal-100 rounded-2xl hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all duration-200">
            <p className="text-teal-800 text-sm font-semibold mb-1">Appointment vs. Walk-in</p>
            <p className="text-teal-700 text-sm leading-relaxed">
              Tranquility Health is an appointment-only telehealth practice. We do not offer walk-in slots. Request an appointment online and our care coordinator will confirm your time within one business day.
            </p>
          </div>
          <div className="p-5 bg-red-50 border border-red-200 rounded-2xl hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all duration-200">
            <p className="text-red-800 text-sm font-semibold mb-1">Mental Health Crisis</p>
            <p className="text-red-700 text-sm leading-relaxed">
              If you are experiencing a mental health emergency, please call <strong>988</strong> (Suicide &amp; Crisis Lifeline) or <strong>911</strong>. Tranquility Health is not an emergency service.
            </p>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="slate" tight>
        <div className="max-w-3xl mx-auto px-4">
          <CtaBlock
            heading="Book during our available hours"
            subtext="Our care coordinator will reach out to confirm your preferred time within one business day."
          />
        </div>
      </SectionWrapper>
    </div>
  );
}
