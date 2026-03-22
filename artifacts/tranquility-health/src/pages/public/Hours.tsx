import { CtaBlock } from "@/components/public/CtaBlock";

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
      {/* Header */}
      <section className="bg-gradient-to-br from-teal-50 to-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900">Office Hours</h1>
          <p className="mt-4 text-xl text-gray-500 leading-relaxed">
            Our schedule is designed around working adults — evenings, Fridays, and Saturdays available.
          </p>
        </div>
      </section>

      {/* Schedule table */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-teal-700 text-white">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Day</th>
                  <th className="text-right px-6 py-4 font-semibold">Available Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {schedule.map(({ day, hours }) => {
                  const closed = hours === "Closed";
                  return (
                    <tr
                      key={day}
                      className={`${closed ? "bg-gray-50" : "hover:bg-teal-50"} transition-colors`}
                    >
                      <td className={`px-6 py-4 font-medium ${closed ? "text-gray-400" : "text-gray-900"}`}>
                        {day}
                      </td>
                      <td className={`px-6 py-4 text-right ${closed ? "text-gray-400" : "text-gray-700"}`}>
                        {closed ? (
                          <span className="text-xs font-semibold uppercase tracking-wider">Closed</span>
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

          <p className="mt-4 text-xs text-gray-400 italic">
            All times are Eastern Time (ET). Hours may vary on federal holidays.
          </p>
        </div>
      </section>

      {/* Notes */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 text-sm font-medium mb-1">Holiday Schedule</p>
            <p className="text-amber-700 text-sm">
              Hours may vary on holidays. We post any schedule changes on this page at least 48 hours in advance. When in doubt, contact us at the number listed on our Contact page.
            </p>
          </div>
          <div className="p-5 bg-teal-50 border border-teal-100 rounded-xl">
            <p className="text-teal-800 text-sm font-medium mb-1">Appointment vs. Walk-in</p>
            <p className="text-teal-700 text-sm">
              Tranquility Health is an appointment-only telehealth practice. We do not offer walk-in slots. Request an appointment online and our care coordinator will confirm your time within one business day.
            </p>
          </div>
          <div className="p-5 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-800 text-sm font-medium mb-1">Mental Health Crisis</p>
            <p className="text-red-700 text-sm">
              If you are experiencing a mental health emergency, please call <strong>988</strong> (Suicide &amp; Crisis Lifeline) or <strong>911</strong>. Tranquility Health is not an emergency service.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <CtaBlock
            heading="Book during our available hours"
            subtext="Our care coordinator will reach out to confirm your preferred time within one business day."
          />
        </div>
      </section>
    </div>
  );
}
