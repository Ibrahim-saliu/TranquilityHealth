export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <p className="text-sm text-teal-600 font-semibold uppercase tracking-wide mb-2">Legal</p>
        <h1 className="text-4xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="mt-3 text-slate-500 text-sm">Last updated: April 2026</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-8">

        <section>
          <p className="text-slate-600 leading-relaxed">
            Tranquility Health ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information you provide when using our website and telehealth services. By using our website or requesting an appointment, you agree to the practices described here.
          </p>
        </section>

        <Section title="1. Information We Collect">
          <p>We collect information you voluntarily provide, including:</p>
          <ul>
            <li><strong>Contact details:</strong> Name, email address, and phone number submitted through our appointment request form or contact page.</li>
            <li><strong>Service preferences:</strong> The type of service you are interested in, preferred appointment times, and any notes you include in your request.</li>
            <li><strong>Technical data:</strong> Standard web server logs including browser type, pages visited, and approximate location derived from your IP address. We do not use this data to identify you personally.</li>
          </ul>
          <p>We do <strong>not</strong> collect payment card numbers, Social Security numbers, or protected health information (PHI) through this website. PHI is only collected during your clinical care and is governed by our separate HIPAA Notice of Privacy Practices.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use the information you provide to:</p>
          <ul>
            <li>Respond to appointment requests and schedule consultations</li>
            <li>Communicate with you about our services, hours, and care team</li>
            <li>Improve our website and service offerings</li>
            <li>Comply with applicable laws and regulations</li>
          </ul>
        </Section>

        <Section title="3. How We Share Your Information">
          <p>We do not sell, rent, or trade your personal information to third parties. We may share your information only in the following circumstances:</p>
          <ul>
            <li><strong>Service providers:</strong> Trusted vendors who help us operate our website and deliver communications (e.g., email delivery, scheduling software), bound by confidentiality agreements.</li>
            <li><strong>Legal requirements:</strong> When required by law, court order, or governmental authority.</li>
            <li><strong>Safety:</strong> When necessary to protect the safety of any person, including in situations involving imminent harm.</li>
          </ul>
        </Section>

        <Section title="4. HIPAA">
          <p>
            Tranquility Health is a HIPAA-covered entity. Health information collected during your care is protected health information (PHI) and is governed by our{" "}
            <a href="/hipaa-notice" className="text-teal-600 hover:text-teal-800 underline">HIPAA Notice of Privacy Practices</a>,
            which describes your rights and our obligations in detail. Please do not submit PHI through this website's contact or request forms.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p>
            We retain contact and appointment request information for as long as necessary to fulfill the purposes described in this policy, or as required by applicable law. You may request deletion of your data at any time (see Section 7).
          </p>
        </Section>

        <Section title="6. Cookies and Tracking">
          <p>
            Our website uses only essential cookies required for basic site functionality. We do not use advertising or tracking cookies, and we do not share browsing data with advertising networks.
          </p>
        </Section>

        <Section title="7. Your Rights">
          <p>Depending on your state of residence (Texas or Maryland), you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information (subject to legal retention requirements)</li>
            <li>Opt out of any marketing communications</li>
          </ul>
          <p>To exercise any of these rights, contact us at <strong>privacy@tranquilityhealth.com</strong>. We will respond within 30 days.</p>
        </Section>

        <Section title="8. Security">
          <p>
            We implement reasonable administrative, technical, and physical safeguards to protect your information from unauthorized access, disclosure, or misuse. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="9. Children">
          <p>
            Our services are intended for adults 18 and older. We do not knowingly collect personal information from individuals under 18 without parental or guardian consent.
          </p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. The date at the top of this page reflects the most recent revision. Continued use of our website after changes are posted constitutes your acceptance of the updated policy.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>If you have questions about this Privacy Policy, please contact us:</p>
          <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
            <p className="font-semibold">Tranquility Health</p>
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
      <div className="space-y-3 text-slate-600 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-slate-800">
        {children}
      </div>
    </section>
  );
}
