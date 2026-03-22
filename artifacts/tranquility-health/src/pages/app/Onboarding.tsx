/**
 * Onboarding — /app/onboarding
 *
 * Patient onboarding flow. Guides new patients through setup steps.
 * Phase 0: Placeholder showing onboarding step structure.
 *
 * TODO (future phase): Implement multi-step onboarding:
 *   1. Verify contact information
 *   2. Insurance / payment method setup
 *   3. Consent forms (ConsentRecord in DB)
 *   4. Mental health intake questionnaire
 *   5. Provider matching / preference selection
 *
 * TODO (Phase 3): Save progress to DB — create Patient record upon completion.
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
        <h1 className="text-3xl font-bold text-gray-900">Welcome to Tranquility Health</h1>
        <p className="mt-2 text-gray-500">
          Let's get you set up. Complete the steps below to start your care journey.
        </p>
      </div>

      {/* Onboarding steps */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {steps.map((step, idx) => (
          <div
            key={step.label}
            className="flex items-center gap-4 p-5 border-b border-gray-100 last:border-b-0"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">
              {idx + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{step.label}</p>
            </div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Pending
              {/* TODO (Phase 3): Replace with real status from DB */}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-teal-50 rounded-lg border border-teal-100">
        <p className="text-teal-800 text-sm font-medium">
          📋 Phase 0 — Placeholder onboarding flow. Full implementation coming in future phases.
        </p>
      </div>
    </div>
  );
}
