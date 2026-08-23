/**
 * Onboarding — /app/onboarding
 *
 * The gate a new patient passes through before the rest of the portal opens.
 * Collects the demographics we need on file and captures the two required
 * consents (HIPAA notice + telehealth). On completion the account flips to
 * "complete" and the patient is sent to their dashboard.
 */

import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { ROUTES } from "@/lib/config/routes";
import { getOnboarding, submitOnboarding } from "@/lib/patient-api";

const fieldClass =
  "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:border-teal-600";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

export default function OnboardingPage() {
  const { refresh } = useAuth();
  const [, navigate] = useLocation();

  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [hipaa, setHipaa] = useState(false);
  const [telehealth, setTelehealth] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOnboarding()
      .then((state) => {
        if (cancelled) return;
        if (state.onboardingStatus === "complete") {
          navigate(ROUTES.app.dashboard, { replace: true });
          return;
        }
        // Prefill anything already on file.
        setFullName(state.fullName ?? "");
        setDateOfBirth(state.dateOfBirth ?? "");
        setPhone(state.phone ?? "");
        setAddress(state.address ?? "");
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!hipaa || !telehealth) {
      setError("Please accept both consents to continue.");
      return;
    }
    setSubmitting(true);
    try {
      await submitOnboarding({
        fullName: fullName.trim(),
        dateOfBirth,
        phone: phone.trim(),
        address: address.trim() || undefined,
        consents: { hipaa: true, telehealth: true },
      });
      await refresh(); // pick up onboardingStatus=complete before navigating
      navigate(ROUTES.app.dashboard, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-slate-400">
        <Loader2 className="w-6 h-6 mx-auto animate-spin mb-3" />
        <p className="text-sm">Loading your setup…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-slate-900">Welcome to Tranquility Health</h1>
        <p className="mt-2 text-slate-500">
          A few details before your first visit. This takes about two minutes.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact & demographics */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-7">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-5">Your details</h2>

          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="ob-name">Full legal name</label>
              <input id="ob-name" className={fieldClass} value={fullName}
                onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} htmlFor="ob-dob">Date of birth</label>
                <input id="ob-dob" type="date" className={fieldClass} value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)} required
                  max={new Date().toISOString().slice(0, 10)} />
              </div>
              <div>
                <label className={labelClass} htmlFor="ob-phone">Phone</label>
                <input id="ob-phone" type="tel" className={fieldClass} value={phone}
                  onChange={(e) => setPhone(e.target.value)} required autoComplete="tel"
                  placeholder="(555) 555-1234" />
              </div>
            </div>

            <div>
              <label className={labelClass} htmlFor="ob-address">
                Mailing address <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea id="ob-address" rows={2} className={fieldClass} value={address}
                onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" />
            </div>
          </div>
        </section>

        {/* Consents */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-7">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-5">Consents</h2>

          <div className="space-y-4">
            <label className="flex gap-3 cursor-pointer">
              <input type="checkbox" checked={hipaa} onChange={(e) => setHipaa(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus-visible:ring-teal-600" />
              <span className="text-sm text-slate-700">
                I have read and acknowledge the{" "}
                <Link href={ROUTES.public.hipaaNotice} className="text-teal-700 underline hover:text-teal-800">
                  HIPAA Notice of Privacy Practices
                </Link>
                .
              </span>
            </label>

            <label className="flex gap-3 cursor-pointer">
              <input type="checkbox" checked={telehealth} onChange={(e) => setTelehealth(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus-visible:ring-teal-600" />
              <span className="text-sm text-slate-700">
                I consent to receive care via telehealth and agree to the{" "}
                <Link href={ROUTES.public.termsOfService} className="text-teal-700 underline hover:text-teal-800">
                  Terms of Service
                </Link>
                .
              </span>
            </label>
          </div>
        </section>

        <div className="flex items-center justify-end gap-4">
          <p className="text-xs text-slate-400">Your information is protected and never shared without your consent.</p>
          <button type="submit" disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-700 text-white text-sm font-semibold rounded-lg hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" strokeWidth={2.4} />}
            {submitting ? "Saving…" : "Complete setup"}
          </button>
        </div>
      </form>
    </div>
  );
}
