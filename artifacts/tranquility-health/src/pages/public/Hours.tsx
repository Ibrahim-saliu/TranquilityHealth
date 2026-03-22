/**
 * Hours — /hours
 *
 * Phase 0: Placeholder page for clinic hours.
 * TODO (future phase): Fetch hours dynamically from admin config, add holiday schedule.
 */

const schedule = [
  { day: "Monday", hours: "8:00 AM – 8:00 PM" },
  { day: "Tuesday", hours: "8:00 AM – 8:00 PM" },
  { day: "Wednesday", hours: "8:00 AM – 8:00 PM" },
  { day: "Thursday", hours: "8:00 AM – 8:00 PM" },
  { day: "Friday", hours: "8:00 AM – 6:00 PM" },
  { day: "Saturday", hours: "10:00 AM – 4:00 PM" },
  { day: "Sunday", hours: "Closed" },
];

export default function HoursPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-gray-900">Hours of Operation</h1>
      <p className="mt-4 text-lg text-gray-500">
        We're here when you need us — including evenings and weekends.
      </p>

      <div className="mt-10 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-gray-700 font-semibold">Day</th>
              <th className="text-right px-6 py-4 text-gray-700 font-semibold">Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schedule.map(({ day, hours }) => (
              <tr
                key={day}
                className={`hover:bg-gray-50 transition-colors ${
                  hours === "Closed" ? "text-gray-400" : "text-gray-700"
                }`}
              >
                <td className="px-6 py-4 font-medium">{day}</td>
                <td className="px-6 py-4 text-right">
                  {hours === "Closed" ? (
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
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

      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
        <p className="text-amber-800 text-sm">
          ⚠️ Hours may vary on holidays. Please check back or contact us for the most
          up-to-date availability.
        </p>
      </div>

      <div className="mt-6 p-6 bg-teal-50 rounded-xl border border-teal-100">
        <p className="text-teal-800 text-sm font-medium">
          📋 Phase 0 — Placeholder content. Dynamic hours and holiday schedule coming in future phases.
        </p>
      </div>
    </div>
  );
}
