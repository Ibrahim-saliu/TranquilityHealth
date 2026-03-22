/**
 * RequestAppointment — /request-appointment
 *
 * Phase 0: Placeholder for the appointment request intake form.
 * This page is a key conversion point for new patients.
 *
 * TODO (future phase): Implement full intake form including:
 *   - Patient info (name, DOB, contact)
 *   - Insurance info
 *   - Presenting concerns / reason for visit
 *   - Provider preference (therapist vs. psychiatry)
 *   - Availability windows
 *
 * TODO (Phase 3): Submit to API route that creates an AppointmentRequest record in DB
 *   and triggers admin notification.
 */

export default function RequestAppointmentPage() {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-gray-900">Request an Appointment</h1>
      <p className="mt-4 text-lg text-gray-500">
        Take the first step. Fill out the form below and we'll reach out within one business day.
      </p>

      {/* Intake form placeholder */}
      <div className="mt-10 p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Patient Intake Form</h2>

        <div className="space-y-5">
          {/* Personal Info section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["First Name", "Last Name", "Date of Birth", "Phone Number"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field}</label>
                  <div className="w-full h-10 bg-gray-50 border border-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          {/* Insurance section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Insurance
            </h3>
            <div className="w-full h-10 bg-gray-50 border border-gray-200 rounded-lg" />
          </div>

          {/* Reason for visit */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Reason for Visit
            </h3>
            <div className="w-full h-28 bg-gray-50 border border-gray-200 rounded-lg" />
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-xs text-gray-400 max-w-sm">
            By submitting this form, you agree to our privacy practices. Your information
            is protected and never sold.
          </p>
          <button
            disabled
            className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg opacity-50 cursor-not-allowed text-sm"
          >
            Submit Request (Coming Soon)
          </button>
        </div>
      </div>

      <div className="mt-8 p-6 bg-teal-50 rounded-xl border border-teal-100">
        <p className="text-teal-800 text-sm font-medium">
          📋 Phase 0 — Form fields are placeholders. Full form implementation coming in future phases.
        </p>
      </div>
    </div>
  );
}
