export default function HipaaNoticePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <p className="text-sm text-teal-600 font-semibold uppercase tracking-wide mb-2">Legal</p>
        <h1 className="text-4xl font-bold text-slate-900">HIPAA Notice of Privacy Practices</h1>
        <p className="mt-3 text-slate-500 text-sm">Last updated: April 2026 · Effective date: April 2026</p>
      </div>

      <div className="mb-8 p-5 bg-teal-50 border border-teal-200 rounded-xl">
        <p className="text-sm text-teal-800 leading-relaxed">
          <strong>THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.</strong>
        </p>
      </div>

      <div className="space-y-8">

        <Section title="Who We Are">
          <p>
            Tranquility Health is a telehealth mental health practice licensed in the states of Texas and Maryland. We provide psychiatric medication management and psychotherapy services. As a covered entity under the Health Insurance Portability and Accountability Act (HIPAA), we are required by law to maintain the privacy of your protected health information (PHI), notify you of our legal duties and privacy practices, and abide by the terms of this notice.
          </p>
        </Section>

        <Section title="What Is Protected Health Information (PHI)?">
          <p>
            PHI is any information we create or receive in the course of providing your care that relates to your past, present, or future physical or mental health, the healthcare services provided to you, or the payment for those services — and that can reasonably be used to identify you. This includes your name, date of birth, diagnosis, treatment records, prescriptions, appointment history, and billing information.
          </p>
        </Section>

        <Section title="How We May Use and Disclose Your PHI">
          <p>We use and disclose your PHI for the following purposes, which do not require your separate authorization:</p>

          <SubSection heading="Treatment">
            <p>We use your PHI to provide, coordinate, and manage your mental health care. For example, your provider may share relevant clinical information with a pharmacy when prescribing medication.</p>
          </SubSection>

          <SubSection heading="Payment">
            <p>We may use your PHI to process payment for services rendered, including providing a Superbill to you for potential insurance reimbursement. As a cash-pay practice, we do not bill insurance companies directly.</p>
          </SubSection>

          <SubSection heading="Healthcare Operations">
            <p>We may use your PHI for internal administrative, quality improvement, and compliance activities, such as reviewing care quality and training clinical staff.</p>
          </SubSection>

          <SubSection heading="As Required by Law">
            <p>We will disclose PHI when required by federal, state, or local law, including mandatory reporting requirements.</p>
          </SubSection>

          <SubSection heading="Public Health and Safety">
            <p>We may disclose PHI to prevent or control disease, report abuse or neglect, or avert a serious threat to the health or safety of a person or the public. This includes situations where we believe there is imminent risk of harm to you or others.</p>
          </SubSection>

          <SubSection heading="Business Associates">
            <p>We may share PHI with third-party service providers (Business Associates) who perform functions on our behalf, such as telehealth platform providers and billing software vendors. These vendors are contractually required to protect your PHI in accordance with HIPAA.</p>
          </SubSection>
        </Section>

        <Section title="Uses and Disclosures Requiring Your Authorization">
          <p>For uses and disclosures beyond those listed above — including most disclosures of psychotherapy notes, marketing uses, and sale of PHI — we will obtain your written authorization. You have the right to revoke an authorization at any time by contacting us in writing. Revocation does not apply to actions already taken in reliance on your authorization.</p>
        </Section>

        <Section title="Your Rights Regarding Your PHI">
          <p>You have the following rights with respect to your PHI:</p>
          <ul>
            <li><strong>Right to access:</strong> You may request a copy of your medical records. We will provide access within 30 days of your request. A reasonable fee may apply for copies.</li>
            <li><strong>Right to amend:</strong> You may request that we correct inaccurate or incomplete PHI. We may deny your request with written explanation.</li>
            <li><strong>Right to an accounting of disclosures:</strong> You may request a list of certain disclosures we have made of your PHI in the past six years (excluding disclosures for treatment, payment, and operations).</li>
            <li><strong>Right to request restrictions:</strong> You may request that we limit how we use or disclose your PHI. We are not required to agree to all restrictions, but we will consider your request.</li>
            <li><strong>Right to confidential communications:</strong> You may request that we communicate with you in a specific way or at a specific location (e.g., only by email, or only at a particular phone number).</li>
            <li><strong>Right to a paper copy of this notice:</strong> You may request a physical copy of this Notice at any time.</li>
          </ul>
          <p>To exercise any of these rights, contact us using the information at the bottom of this notice.</p>
        </Section>

        <Section title="Our Responsibilities">
          <p>Tranquility Health is required to:</p>
          <ul>
            <li>Maintain the privacy of your PHI</li>
            <li>Provide you with notice of our privacy practices</li>
            <li>Notify you if there is a breach of your unsecured PHI</li>
            <li>Follow the terms of this notice</li>
            <li>Not use or disclose your PHI in a way that is inconsistent with this notice without your authorization, unless required by law</li>
          </ul>
        </Section>

        <Section title="Changes to This Notice">
          <p>
            We reserve the right to change this Notice and to make the revised notice effective for PHI we already hold about you as well as PHI we receive in the future. The current version of this Notice will always be available on our website. We will notify you of material changes.
          </p>
        </Section>

        <Section title="Complaints">
          <p>
            If you believe your privacy rights have been violated, you have the right to file a complaint with Tranquility Health or with the U.S. Department of Health and Human Services Office for Civil Rights. We will not retaliate against you for filing a complaint.
          </p>
          <div className="mt-3 space-y-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
              <p className="font-semibold mb-1">Tranquility Health — Privacy Officer</p>
              <p>Email: privacy@tranquilityhealth.com</p>
              <p>Licensed in Texas and Maryland</p>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
              <p className="font-semibold mb-1">U.S. Department of Health & Human Services — Office for Civil Rights</p>
              <p>Website: <a href="https://www.hhs.gov/hipaa/filing-a-complaint" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-800 underline">hhs.gov/hipaa/filing-a-complaint</a></p>
              <p>Phone: 1-800-368-1019 (TTY: 1-800-537-7697)</p>
            </div>
          </div>
        </Section>

        <Section title="Contact Us">
          <p>For questions about this Notice or to exercise your privacy rights:</p>
          <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
            <p className="font-semibold">Tranquility Health — Privacy Officer</p>
            <p>Email: privacy@tranquilityhealth.com</p>
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
      <div className="space-y-4 text-slate-600 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_strong]:text-slate-800">
        {children}
      </div>
    </section>
  );
}

function SubSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{heading}</h3>
      <div className="text-slate-600 leading-relaxed">{children}</div>
    </div>
  );
}
