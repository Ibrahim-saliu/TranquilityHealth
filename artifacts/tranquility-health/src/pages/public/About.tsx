import { CtaBlock } from "@/components/public/CtaBlock";
import { PageHeader } from "@/components/public/PageHeader";
import { SectionWrapper } from "@/components/public/SectionWrapper";

const values = [
  {
    iconSrc: "/icons/icon-accessibility.png",
    title: "Accessibility",
    description: "Quality mental health care should not depend on geography, transportation, or scheduling luck. We built for accessibility from the ground up.",
  },
  {
    iconSrc: "/icons/icon-evidence.png",
    title: "Evidence-Based Practice",
    description: "We use evidence-based approaches with strong research backing, tailored to each patient's health, circumstances, and goals.",
  },
  {
    iconSrc: "/icons/icon-compassion.png",
    title: "Genuine Compassion",
    description: "We know it takes courage to ask for help. Every interaction at Tranquility Health is designed to make that step feel safe.",
  },
  {
    iconSrc: "/icons/icon-privacy.png",
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
      />

      {/* Provider Profile */}
      <SectionWrapper variant="white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Meet Dr. Oluwole Oke</h2>
          <div className="bg-gradient-to-br from-teal-50 to-indigo-50 border border-teal-100 rounded-2xl p-8 flex flex-col sm:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="w-40 h-48 rounded-xl overflow-hidden shadow-lg ring-4 ring-white">
                <img src="/dr-oke.png" alt="Dr. Oluwole Oke, Founder of Tranquility Health" className="w-full h-full object-cover object-top" />
              </div>
            </div>
            {/* Bio */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900">Dr. Oluwole Oke</h3>
              <p className="text-sm text-teal-700 font-semibold mt-1">
                DNAP, CRNA, PMHNP-BC
              </p>
              <p className="text-xs text-slate-500 italic mt-0.5 mb-4">
                Psychiatric Mental Health Nurse Practitioner | Doctor of Nurse Anesthesia Practice
              </p>
              <div className="space-y-3 text-slate-600 leading-relaxed text-sm">
                <p>
                  Dr. Oluwole Oke is a board-certified Psychiatric Mental Health Nurse Practitioner (PMHNP-BC), Certified Registered Nurse Anesthetist (CRNA), and Doctor of Nurse Anesthesia Practice (DNAP) with more than a decade of experience caring for individuals across diverse clinical settings.
                </p>
                <p>
                  As the founder of <strong className="font-semibold text-slate-800">Tranquility Comprehensive Health LLC</strong>, Dr. Oke is committed to providing compassionate, evidence-based mental health care in an environment where patients feel heard, respected, and actively involved in their treatment.
                </p>
                <p>
                  Dr. Oke provides psychiatric evaluation, diagnosis, medication management, and ongoing mental health care for adolescents and adults experiencing concerns such as anxiety, depression, stress and burnout, attention difficulties, mood disorders, and sleep-related challenges. His approach is individualized, recognizing that effective mental health care should consider each patient's health, lifestyle, circumstances, and personal goals.
                </p>
                <p>
                  His extensive background in anesthesia provides an additional depth of experience in pharmacology, physiology, patient safety, clinical assessment, and medication management. Combined with his psychiatric training, this allows him to consider both the mental and physical aspects of a patient's health when developing an appropriate treatment plan.
                </p>
                <p>
                  At the heart of Dr. Oke's practice is a simple philosophy: <strong className="font-semibold text-slate-800">every patient deserves to be treated with dignity, compassion, respect, and without judgment.</strong> He believes meaningful progress begins by listening carefully, understanding each patient's concerns, and working collaboratively toward greater stability, resilience, and overall well-being.
                </p>
                <p>
                  Beyond his clinical practice, Dr. Oke is committed to healthcare leadership, education, and mentorship. He is a co-founder of the Nigerian American Nurse Anesthetists Association (NANAA), supporting professional development and advancement within the healthcare profession.
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="tint">
        <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
              Tranquility Health was founded on a simple belief: mental health support should be accessible, compassionate, and convenient. We remove barriers to care by delivering licensed therapy and psychiatric services directly to you, wherever you are.
            </p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We specialize in medication management and psychotherapy for depression, anxiety, mood disorders, sleep disorders, personality disorders, and schizophrenia. Our telehealth model means you can meet with a licensed provider from your home, your car, or anywhere private. No commute, no waiting room.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-amber-100 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-md ring-1 ring-slate-100/80 flex items-center justify-center mb-5 p-2.5">
              <img src="/icons/icon-compassion.png" alt="" className="w-full h-full object-contain" />
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

      <SectionWrapper variant="brand">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Your care, led by Dr. Oke</h2>
          <p className="text-slate-600 leading-relaxed max-w-2xl mb-8">
            At Tranquility Health, your care is provided directly by Dr. Oluwole Oke, a board-certified Psychiatric Mental Health Nurse Practitioner (PMHNP-BC) licensed in Texas and Maryland. From your initial evaluation through ongoing follow-up, you work with the same provider, so your treatment stays consistent, personal, and informed by your history.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { role: "Psychiatric evaluation", detail: "Comprehensive assessment and diagnosis", gradient: "from-teal-500 to-teal-600" },
              { role: "Medication management", detail: "Ongoing treatment, monitoring, and adjustments", gradient: "from-indigo-500 to-indigo-600" },
              { role: "Ongoing mental health care", detail: "Regular follow-up focused on your goals", gradient: "from-violet-500 to-violet-600" },
            ].map((r) => (
              <div key={r.role} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
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
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">What guides us</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-teal-100 transition-all duration-200">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-md ring-1 ring-slate-100/80 flex items-center justify-center mb-4 p-2.5">
                  <img src={v.iconSrc} alt="" className="w-full h-full object-contain" />
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
