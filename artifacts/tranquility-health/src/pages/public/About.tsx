import { Heart, Shield, FlaskConical, Users } from "lucide-react";
import { CtaBlock } from "@/components/public/CtaBlock";
import { PageHeader } from "@/components/public/PageHeader";
import { SectionWrapper } from "@/components/public/SectionWrapper";

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
    description: "Our clinicians use therapies with strong research backing, including CBT, DBT, and motivational interviewing, tailored to each patient's needs.",
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
      <PageHeader
        title="About Tranquility Health"
        subtitle="We believe everyone deserves access to compassionate, high-quality mental health care, free from the barriers that have kept so many from getting the help they need."
        badge="Our Story"
      />

      {/* Provider Profile */}
      <SectionWrapper variant="white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Meet Your Clinician</h2>
          <div className="bg-gradient-to-br from-teal-50 to-indigo-50 border border-teal-100 rounded-2xl p-8 flex flex-col sm:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-400 to-indigo-600 flex items-center justify-center shadow-lg ring-4 ring-white">
                <svg className="w-14 h-14 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold border border-teal-200">
                Licensed in Texas
              </span>
            </div>
            {/* Bio */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">Dr. Maya Okafor, PMHNP-BC</h3>
              <p className="text-sm text-teal-700 font-medium mt-1 mb-4">
                Psychiatric Mental Health Nurse Practitioner · Board Certified
              </p>
              <p className="text-slate-600 leading-relaxed text-sm mb-3">
                Dr. Okafor has spent over a decade working alongside patients navigating depression, anxiety, mood disorders, and complex psychiatric conditions. She founded Tranquility Health after seeing how many Texans were going without care simply because of scheduling barriers and the cost of traditional psychiatric visits.
              </p>
              <p className="text-slate-600 leading-relaxed text-sm">
                "Everyone deserves access to a clinician who truly listens. I built this practice to remove the friction: no long commutes, no confusing insurance bills, just honest, evidence-based care on a schedule that actually works for you."
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Medication Management", "Psychotherapy Supervision", "CBT", "DBT", "Motivational Interviewing"].map((tag) => (
                  <span key={tag} className="inline-block bg-white border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="slate">
        <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
              Tranquility Health was founded on a simple belief: mental health support should be accessible, compassionate, and convenient. We remove barriers to care by delivering licensed therapy and psychiatric services directly to you, wherever you are.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We specialize in medication management and psychotherapy for depression, anxiety, mood disorders, sleep disorders, personality disorders, and schizophrenia. Our telehealth model means you can meet with a licensed provider from your home, your car, or anywhere private. No commute, no waiting room.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
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
      </SectionWrapper>

      <SectionWrapper variant="white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Our Clinical Team</h2>
          <p className="text-slate-600 leading-relaxed max-w-2xl mb-8">
            Our network of licensed mental health professionals includes therapists, counselors, and psychiatric nurse practitioners, all rigorously vetted and committed to evidence-based care. Every clinician on our platform holds an active state license and maintains continuing education in their area of specialty.
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
      </SectionWrapper>

      <SectionWrapper variant="slate">
        <div className="max-w-4xl mx-auto px-4">
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
      </SectionWrapper>

      <SectionWrapper variant="white" tight>
        <div className="max-w-4xl mx-auto px-4">
          <CtaBlock
            heading="Let's take this step together"
            subtext="Our care team is here to make your first appointment as easy and comfortable as possible."
          />
        </div>
      </SectionWrapper>
    </div>
  );
}
