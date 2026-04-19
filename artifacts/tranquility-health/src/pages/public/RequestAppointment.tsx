import { useState, FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config/env";
import { PageHeader } from "@/components/public/PageHeader";
import { SectionWrapper } from "@/components/public/SectionWrapper";

type ServiceInterest = "therapy" | "medication" | "not_sure";
type ContactMethod = "phone" | "email";
type FormStatus = "idle" | "submitting" | "success" | "error";

interface FieldError {
  field: string;
  message: string;
}

const serviceOptions: { value: ServiceInterest; label: string; description: string }[] = [
  { value: "therapy", label: "Psychotherapy", description: "Individual counseling sessions with a licensed therapist" },
  { value: "medication", label: "Medication Management", description: "Psychiatric evaluation and medication management for depression, anxiety, mood disorders, and more" },
  { value: "not_sure", label: "Not sure yet", description: "Talk to our care coordinator to figure out the best fit" },
];

export default function RequestAppointmentPage() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceInterest, setServiceInterest] = useState<ServiceInterest | "">("");
  const [preferredTime, setPreferredTime] = useState("");
  const [preferredContactMethod, setPreferredContactMethod] = useState<ContactMethod | "">("");
  const [isNewPatient, setIsNewPatient] = useState<boolean | null>(null);
  const [contactConsent, setContactConsent] = useState(false);

  function getFieldError(field: string): string | undefined {
    return fieldErrors.find((e) => e.field === field)?.message;
  }

  function validateClientSide(): FieldError[] {
    const errors: FieldError[] = [];
    if (!fullName.trim()) errors.push({ field: "fullName", message: "Full name is required." });
    if (!email.trim()) {
      errors.push({ field: "email", message: "Email address is required." });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push({ field: "email", message: "Please enter a valid email address." });
    }
    if (!phone.trim()) errors.push({ field: "phone", message: "Phone number is required." });
    if (!serviceInterest) errors.push({ field: "serviceInterest", message: "Please select a service." });
    if (!preferredTime) errors.push({ field: "preferredTime", message: "Please select a preferred time." });
    if (!contactConsent) errors.push({ field: "contactConsent", message: "You must consent to be contacted." });
    return errors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFieldErrors([]);
    setServerError(null);

    const clientErrors = validateClientSide();
    if (clientErrors.length > 0) {
      setFieldErrors(clientErrors);
      setStatus("error");
      return;
    }

    setStatus("submitting");

    const payload = {
      fullName,
      email,
      phone,
      serviceInterest,
      preferredTime,
      preferredContactMethod: preferredContactMethod || undefined,
      isNewPatient: isNewPatient ?? undefined,
      contactConsent,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/appointment-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 400) {
        const data = await res.json() as { issues: FieldError[] };
        setFieldErrors(data.issues ?? []);
        setStatus("error");
        return;
      }

      if (!res.ok) {
        setServerError("Something went wrong. Please try again or call us directly.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setServerError("Unable to reach our servers. Please check your connection and try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div
          className="bg-gradient-to-br from-teal-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          style={{ width: 72, height: 72 }}
        >
          <CheckCircle2 className="w-9 h-9 text-white" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Request received!</h1>
        <p className="mt-4 text-lg text-slate-500 leading-relaxed">
          Thank you, {fullName}. Our care coordinator will contact you at your preferred contact method within one business day to schedule your appointment.
        </p>
        <div className="mt-8 p-5 bg-gradient-to-br from-teal-50 to-indigo-50 border border-teal-100 rounded-2xl text-left">
          <p className="text-sm text-teal-700">
            <span className="font-semibold">What happens next:</span> Our care coordinator will reach out, answer any questions you have, and confirm your appointment time. Payment is due at the time of your appointment.
          </p>
        </div>
        <p className="mt-8 text-sm text-slate-400">
          If you have an urgent need, call us at (555) 000-0000 during office hours.
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Request an Appointment"
        subtitle="Takes about 3 minutes. No account required. We'll contact you within one business day."
      />

      <SectionWrapper variant="slate">
        <div className="max-w-2xl mx-auto px-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100">

              {/* Section: Contact Info */}
              <div className="p-8">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5">
                  Contact Information
                </h2>
                <div className="space-y-5">
                  <Field label="Full Name" required error={getFieldError("fullName")}>
                    <input
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Smith"
                      className={inputClass(getFieldError("fullName"))}
                    />
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Email Address" required error={getFieldError("email")}>
                      <input
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className={inputClass(getFieldError("email"))}
                      />
                    </Field>

                    <Field label="Phone Number" required error={getFieldError("phone")}>
                      <input
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        className={inputClass(getFieldError("phone"))}
                      />
                    </Field>
                  </div>

                  <Field label="Preferred Contact Method" error={getFieldError("preferredContactMethod")}>
                    <div className="flex gap-4">
                      {(["phone", "email"] as ContactMethod[]).map((m) => (
                        <label key={m} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="contactMethod"
                            value={m}
                            checked={preferredContactMethod === m}
                            onChange={() => setPreferredContactMethod(m)}
                            className="w-4 h-4 text-teal-600 border-slate-300"
                          />
                          <span className="text-sm text-slate-700 capitalize">{m}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>

              {/* Section: Service Interest */}
              <div className="p-8">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5">
                  What are you looking for?
                </h2>
                <Field label="Service Interest" required error={getFieldError("serviceInterest")}>
                  <div className="space-y-3">
                    {serviceOptions.map(({ value, label, description }) => (
                      <label
                        key={value}
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                          serviceInterest === value
                            ? "border-teal-400 bg-teal-50 shadow-sm"
                            : "border-slate-200 hover:border-teal-300 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="serviceInterest"
                          value={value}
                          checked={serviceInterest === value}
                          onChange={() => setServiceInterest(value)}
                          className="mt-0.5 w-4 h-4 text-teal-600 border-slate-300 flex-shrink-0"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </Field>
              </div>

              {/* Section: Scheduling */}
              <div className="p-8">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-5">
                  Scheduling Preferences
                </h2>
                <div className="space-y-5">
                  <Field label="Preferred Day / Time" required error={getFieldError("preferredTime")}>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className={inputClass(getFieldError("preferredTime"))}
                    >
                      <option value="">Select a preference…</option>
                      <optgroup label="Monday – Thursday evenings (5–9 PM CST)">
                        <option value="weekday_evenings">Weekday evenings (Mon–Thu, 5–9 PM)</option>
                      </optgroup>
                      <optgroup label="Friday">
                        <option value="friday_morning">Friday morning (8 AM–1 PM CST)</option>
                        <option value="friday_afternoon">Friday afternoon (3–7 PM CST)</option>
                      </optgroup>
                      <optgroup label="Saturday (8 AM–4 PM CST)">
                        <option value="saturday_morning">Saturday morning (8 AM–12 PM)</option>
                        <option value="saturday_afternoon">Saturday afternoon (12–4 PM)</option>
                      </optgroup>
                    </select>
                  </Field>

                  <Field label="Are you a new patient?" error={getFieldError("isNewPatient")}>
                    <div className="flex gap-4">
                      {[
                        { value: true, label: "Yes, new patient" },
                        { value: false, label: "No, returning patient" },
                      ].map(({ value, label }) => (
                        <label key={String(value)} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="isNewPatient"
                            checked={isNewPatient === value}
                            onChange={() => setIsNewPatient(value)}
                            className="w-4 h-4 text-teal-600 border-slate-300"
                          />
                          <span className="text-sm text-slate-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>

              {/* Section: Consent & Submit */}
              <div className="p-8">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contactConsent}
                    onChange={(e) => setContactConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 text-teal-600 border-slate-300 rounded flex-shrink-0"
                  />
                  <span className="text-sm text-slate-600 leading-relaxed">
                    I consent to being contacted by Tranquility Health via phone or email to schedule my appointment and discuss my care. I understand this is not a medical emergency service.
                    {getFieldError("contactConsent") && (
                      <span className="block text-red-500 text-xs mt-1">{getFieldError("contactConsent")}</span>
                    )}
                  </span>
                </label>

                <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                  Your information is protected. We will never sell your contact details. By submitting this form you acknowledge that you are not sharing protected health information (PHI). Your detailed health history will be discussed privately during your appointment.
                </p>

                {serverError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-700 text-sm">{serverError}</p>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="px-8 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "submitting" ? "Submitting…" : "Submit Request"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </SectionWrapper>
    </div>
  );
}

function inputClass(error?: string) {
  return `w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors ${
    error ? "border-red-300 bg-red-50" : "border-slate-200 bg-white hover:border-slate-300"
  }`;
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
