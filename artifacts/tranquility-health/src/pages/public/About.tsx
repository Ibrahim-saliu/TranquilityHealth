import { Heart, Shield, FlaskConical, Users } from "lucide-react";
import { CtaBlock } from "@/components/public/CtaBlock";

const values = [
  {
    Icon: Users,
    gradient: "from-teal-500 to-teal-600",
    title: "Accessibility",
    description: "Quality mental health care should not depend on geography, transportation, or scheduling luck. We built for accessibility from the ground up.",
  },
  {
    Icon: FlaskConical,
    gradient: "from-indigo-500 to-indigo-600",
    title: "Evidence-Based Practice",
    description: "Our clinicians use therapies with strong research backing — CBT, DBT, motivational interviewing — tailored to each patient's needs.",
  },
  {
    Icon: Heart,
    gradient: "from-violet-500 to-violet-600",
    title: "Genuine Compassion",
    description: "We know it takes courage to ask for help. Every interaction at Tranquility Health is designed to make that step feel safe.",
  },
  {
    Icon: Shield,
    gradient: "from-teal-400 to-indigo-500",
    title: "Privacy First",
    description: "Your health information belongs to you. Our platform is built with HIPAA-conscious practices at every layer.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Header */}
      <section className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-indigo-900 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-400 blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-500 blur-3xl translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <span className="inline-block bg-white/10 border border-white/20 text-teal-200 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-5">
            Our Story
          </span>
          <h1 className="text-4xl font-bold text-white">About Tranquility Health</h1>
          <p className="mt-4 text-xl text-slate-300 leading-relaxed max-w-2xl">
            We believe everyone deserves access to compassionate, high-quality mental health care — without the barriers that have kept so many from getting the help they need.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
              Tranquility Health was founded on a simple belief: mental health support should be accessible, compassionate, and convenient. We remove barriers to care by delivering licensed therapy and psychiatric services directly to you — wherever you are.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We specialize in medication management and psychotherapy for depression, anxiety, mood disorders, sleep disorders, personality disorders, and schizophrenia. Our telehealth model means you can meet with a licensed provider from your home, your car, or anywhere private — no commute, no waiting room.
            </p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-indigo-50 rounded-2xl p-8 border border-teal-100">
            <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-xl flex items-center justify-center mb-5 shadow-md">
              <Heart className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <p className="text-slate-900 font-semibold text-lg mb-3">What we treat</p>
            <ul className="space-y-2">
              {["Depression", "Anxiety", "Mood Disorders", "Sleep Disorders", "Personality Disorders", "Schizophrenia"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-700 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Our Clinical Team</h2>
          <p className="text-slate-600 leading-relaxed max-w-2xl mb-8">
            Our network of licensed mental health professionals includes therapists, counselors, and psychiatric nurse practitioners — all rigorously vetted and committed to evidence-based care. Every clinician on our platform holds an active state license and maintains continuing education in their area of specialty.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { role: "Licensed Therapists (LCSW, LPC)", detail: "Individual therapy, CBT, DBT, and more", gradient: "from-teal-500 to-teal-600" },
              { role: "Psychiatric NPs", detail: "Evaluation, diagnosis, and medication management", gradient: "from-indigo-500 to-indigo-600" },
              { role: "Care Coordinators", detail: "Scheduling, follow-up, and patient support", gradient: "from-violet-500 to-violet-600" },
            ].map((r) => (
              <div key={r.role} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-2 h-8 bg-gradient-to-b ${r.gradient} rounded-full mb-4`} />
                <p className="text-sm font-semibold text-slate-900">{r.role}</p>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-10 text-center">What guides us</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 bg-gradient-to-br ${v.gradient} rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                  <v.Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-slate-50">
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
