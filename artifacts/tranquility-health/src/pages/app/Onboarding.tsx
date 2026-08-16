/**
 * Onboarding — /app/onboarding
 *
 * Guides a new patient through the steps required before their first visit:
 * contact verification, payment setup, consent, intake, and provider selection.
 * The steps below are presented statically until the intake flow is built out.
 */

const steps = [
  { label: "Verify Contact Info", status: "pending" },
  { label: "Insurance Setup", status: "pending" },
  { label: "Sign Consent Forms", status: "pending" },
  { label: "Complete Intake Questionnaire", status: "pending" },
  { label: "Choose Your Provider", status: "pending" },
];

export default function OnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Welcome to Tranquility Health</h1>
        <p className="mt-2 text-slate-500">
          Let's get you set up. Complete the steps below to start your care journey.
        </p>
      </div>

      {/* Onboarding steps */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {steps.map((step, idx) => (
          <div
            key={step.label}
            className="flex items-center gap-4 p-5 border-b border-slate-100 last:border-b-0"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-400">
              {idx + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">{step.label}</p>
            </div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Pending
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
