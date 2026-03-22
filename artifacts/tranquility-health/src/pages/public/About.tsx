import { CtaBlock } from "@/components/public/CtaBlock";

const values = [
  {
    title: "Accessibility",
    description: "Quality mental health care should not depend on geography, transportation, or scheduling luck. We built for accessibility from the ground up.",
  },
  {
    title: "Evidence-Based Practice",
    description: "Our clinicians use therapies with strong research backing — CBT, DBT, motivational interviewing — tailored to each patient's needs.",
  },
  {
    title: "Genuine Compassion",
    description: "We know it takes courage to ask for help. Every interaction at Tranquility Health is designed to make that step feel safe.",
  },
  {
    title: "Privacy First",
    description: "Your health information belongs to you. Our platform is built with HIPAA-conscious practices at every layer.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-teal-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900">About Tranquility Health</h1>
          <p className="mt-4 text-xl text-gray-500 leading-relaxed max-w-2xl">
            We believe everyone deserves access to compassionate, high-quality mental health care — without the barriers that have kept so many from getting the help they need.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Tranquility Health was founded on a simple belief: mental health support should be accessible, compassionate, and convenient. We remove barriers to care by delivering licensed therapy and psychiatric services directly to you — wherever you are.
            </p>
            <p className="mt-4 text-gray-600 leading-relaxed">
              We specialize in anxiety, depression, ADHD, and related conditions. Our telehealth model means you can meet with a licensed provider from your home, your car, or anywhere private — no commute, no waiting room.
            </p>
          </div>
          <div className="bg-teal-50 rounded-2xl p-8 border border-teal-100">
            <p className="text-4xl mb-4">🌱</p>
            <p className="text-teal-800 font-semibold text-lg mb-2">What we treat</p>
            <ul className="space-y-1 text-teal-700 text-sm">
              <li>• Anxiety disorders (GAD, panic, social anxiety)</li>
              <li>• Depression and mood disorders</li>
              <li>• ADHD (adult and adolescent)</li>
              <li>• OCD and related conditions</li>
              <li>• Life transitions and stress</li>
              <li>• Medication management</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Clinical Team</h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            Our network of licensed mental health professionals includes therapists, counselors, and psychiatric nurse practitioners — all rigorously vetted and committed to evidence-based care. Every clinician on our platform holds an active state license and maintains continuing education in their area of specialty.
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-6">
            {[
              { role: "Licensed Therapists (LCSW, LPC)", detail: "Individual therapy, CBT, DBT, and more" },
              { role: "Psychiatric NPs", detail: "Evaluation, diagnosis, and medication management" },
              { role: "Care Coordinators", detail: "Scheduling, follow-up, and patient support" },
            ].map((r) => (
              <div key={r.role} className="bg-white rounded-xl p-5 border border-gray-200">
                <p className="text-sm font-semibold text-gray-900">{r.role}</p>
                <p className="text-xs text-gray-500 mt-1">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What guides us</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <CtaBlock
            heading="Let's take this step together"
            subtext="Our care team is here to make your first appointment as easy and comfortable as possible."
          />
        </div>
      </section>
    </div>
  );
}
