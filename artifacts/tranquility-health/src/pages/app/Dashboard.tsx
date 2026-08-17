import { Link } from "wouter";
import { CalendarDays, Check } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { ROUTES } from "@/lib/config/routes";

// Static until the onboarding + appointment endpoints land; the layout is the
// single-focus "what's next, and am I ready?" shell.
const READINESS = [
  { label: "Verify your contact info", done: true },
  { label: "Add a payment method", done: true },
  { label: "Sign consent forms", done: false, current: true },
  { label: "Complete intake questionnaire", done: false },
];

export default function AppDashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {firstName}</h1>
        <p className="mt-1 text-slate-500">Here's what's next in your care.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-5">
        {/* Next appointment */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-7 flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Your next appointment</p>
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
            <CalendarDays className="w-10 h-10 text-slate-300 mb-3" strokeWidth={1.5} />
            <p className="text-base font-semibold text-slate-800">No upcoming appointments</p>
            <p className="mt-1.5 text-sm text-slate-500 max-w-xs">
              Your care coordinator will reach out to schedule your first visit. You'll see it here, with a button to
              join when it's time.
            </p>
          </div>
        </section>

        {/* Get ready */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Get ready</p>
          <p className="mt-1 text-sm text-slate-500">A few steps before your first visit.</p>
          <ul className="mt-5 space-y-1">
            {READINESS.map((step) => (
              <li key={step.label} className="flex items-center gap-3 py-2.5 border-b border-dashed border-slate-100 last:border-b-0">
                <span
                  className={`flex-none w-6 h-6 rounded-full grid place-items-center text-[11px] font-bold ${
                    step.done
                      ? "bg-teal-700 text-white"
                      : step.current
                        ? "bg-teal-50 text-teal-800 border border-teal-200"
                        : "bg-slate-50 text-slate-400 border border-slate-200"
                  }`}
                >
                  {step.done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : READINESS.indexOf(step) + 1}
                </span>
                <span className={`text-sm ${step.done ? "text-slate-400 line-through" : "text-slate-700"}`}>
                  {step.label}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href={ROUTES.app.onboarding}
            className="mt-6 inline-flex items-center justify-center w-full px-4 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 transition-colors"
          >
            Continue setup
          </Link>
        </section>
      </div>
    </div>
  );
}
