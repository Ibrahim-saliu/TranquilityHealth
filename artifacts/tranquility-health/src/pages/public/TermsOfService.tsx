export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <p className="text-sm text-teal-600 font-semibold uppercase tracking-wide mb-2">Legal</p>
        <h1 className="text-4xl font-bold text-slate-900">Terms of Service</h1>
        <p className="mt-3 text-slate-500 text-sm">Last updated: April 2026</p>
      </div>

      <div className="space-y-8">

        <section>
          <p className="text-slate-600 leading-relaxed">
            These Terms of Service ("Terms") govern your use of the Tranquility Health website and telehealth services. By accessing our website or requesting an appointment, you agree to these Terms. Please read them carefully.
          </p>
        </section>

        <Section title="1. About Tranquility Health">
          <p>
            Tranquility Health provides telehealth-based psychiatric medication management and psychotherapy services. We are a cash-pay practice and do not accept insurance. Our licensed providers are authorized to practice in the states of <strong>Texas</strong> and <strong>Maryland</strong>.
          </p>
          <p>
            Our services are intended for adults 18 years of age and older residing in Texas or Maryland. We cannot provide services to individuals located outside these states at the time of their appointment.
          </p>
        </Section>

        <Section title="2. Not an Emergency Service">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-semibold text-red-800 mb-1">Important — Emergency situations</p>
            <p className="text-red-700">
              Tranquility Health is <strong>not</strong> an emergency service. If you are experiencing a psychiatric emergency, are at risk of harming yourself or others, or require immediate medical attention, call <strong>911</strong> or go to your nearest emergency room immediately. You may also call or text <strong>988</strong> (Suicide and Crisis Lifeline), available 24/7.
            </p>
          </div>
        </Section>

        <Section title="3. Telehealth Consent">
          <p>By requesting and attending appointments with Tranquility Health, you acknowledge and consent to the following:</p>
          <ul>
            <li>Telehealth services are delivered via video or audio connection and may involve the electronic transmission of personal health information.</li>
            <li>There are potential risks associated with telehealth, including technology failures, interruptions, and limitations on the provider's ability to assess certain physical conditions remotely.</li>
            <li>You have the right to withdraw consent for telehealth at any time. If you withdraw, your care may need to be transitioned to an in-person provider.</li>
            <li>Telehealth does not replace in-person care when in-person assessment is clinically necessary.</li>
            <li>You are responsible for ensuring you are in a private location during appointments and that your technology (internet connection, camera, microphone) is functioning.</li>
          </ul>
        </Section>

        <Section title="4. Cash-Pay and Fees">
          <p>
            Tranquility Health is a cash-pay practice. Payment is due at the time of service. We do not bill insurance directly, and we are not responsible for reimbursement by your insurance carrier. A Superbill (receipt for out-of-network reimbursement) may be provided upon request.
          </p>
          <p>
            Fees for specific services are provided at the time of scheduling. We reserve the right to update our fees with reasonable notice.
          </p>
        </Section>

        <Section title="5. Appointment Policy">
          <ul>
            <li>Appointment requests submitted through our website are not confirmed until you receive direct confirmation from our care team.</li>
            <li>Cancellations must be made with at least 24 hours' notice to avoid a late cancellation fee.</li>
            <li>No-shows may be charged the full session fee at our discretion.</li>
          </ul>
        </Section>

        <Section title="6. Website Use">
          <p>
            You agree to use this website only for lawful purposes. You may not use the website to submit false or misleading information, attempt to gain unauthorized access to our systems, or engage in any activity that disrupts or interferes with the website's operation.
          </p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>
            All content on this website — including text, graphics, logos, and images — is the property of Tranquility Health and is protected by applicable intellectual property laws. You may not reproduce, distribute, or modify any content without our written permission.
          </p>
        </Section>

        <Section title="8. Disclaimers">
          <p>
            The information on this website is provided for general informational purposes only and does not constitute medical advice. No provider-patient relationship is established by visiting this website or submitting an appointment request. A clinical relationship is only established when a provider has formally agreed to treat you and you have consented to care.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>
            To the fullest extent permitted by law, Tranquility Health and its providers shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or services. Our total liability for any claim shall not exceed the fees paid by you for the specific service giving rise to the claim.
          </p>
        </Section>

        <Section title="10. Governing Law">
          <p>
            These Terms are governed by the laws of the State of Texas, without regard to its conflict-of-law principles. Any disputes arising under these Terms shall be resolved in the courts of Travis County, Texas.
          </p>
        </Section>

        <Section title="11. Changes to These Terms">
          <p>
            We may update these Terms from time to time. The date at the top of this page reflects the most recent revision. Your continued use of our website after changes are posted constitutes acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="12. Contact Us">
          <p>Questions about these Terms? Reach us at:</p>
          <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
            <p className="font-semibold">Tranquility Health</p>
            <p>Email: legal@tranquilityhealth.com</p>
            <p>Licensed in Texas and Maryland</p>
          </div>
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900 mb-3">{title}</h2>
      <div className="space-y-3 text-slate-600 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-slate-800">
        {children}
      </div>
    </section>
  );
}
