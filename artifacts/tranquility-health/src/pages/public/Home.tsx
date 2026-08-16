import { Link } from "wouter";
import { useEffect, useState } from "react";
import { ROUTES } from "@/lib/config/routes";
import { CtaBlock } from "@/components/public/CtaBlock";
import { VideoHero } from "@/components/public/VideoHero";
import { Reveal } from "@/components/public/Reveal";

const HERO_WORDS = ["anywhere", "at home", "on your schedule"];

const features = [
  {
    iconSrc: "/icons/icon-video-call.png",
    title: "Video Appointments",
    description: "Secure, HIPAA-conscious video sessions with licensed clinicians from the comfort of your home.",
  },
  {
    iconSrc: "/icons/icon-medication.png",
    title: "Medication Management",
    description: "Psychiatric medication evaluation and ongoing management for depression, anxiety, mood disorders, and more.",
  },
  {
    iconSrc: "/icons/icon-therapy.png",
    title: "Psychotherapy",
    description: "Individual counseling sessions using evidence-based approaches tailored to your needs and goals.",
  },
  {
    iconSrc: "/icons/icon-sleep-mood.png",
    title: "Sleep & Mood Disorders",
    description: "Specialized care for sleep disorders, mood disorders, personality disorders, and schizophrenia.",
  },
  {
    iconSrc: "/icons/icon-new-patient.png",
    title: "New Patient Friendly",
    description: "First time seeking mental health care? We'll walk you through every step of the process.",
  },
  {
    iconSrc: "/icons/icon-scheduling.png",
    title: "Flexible Scheduling",
    description: "Evening and weekend availability designed to work around your schedule, not the other way around.",
  },
];

const steps = [
  {
    step: "1",
    gradient: "from-teal-500 to-teal-600",
    title: "Submit a request",
    body: "Fill out our short appointment request form. No account needed. Just your contact info and a bit about what you're looking for.",
  },
  {
    step: "2",
    gradient: "from-teal-500 to-indigo-600",
    title: "We reach out",
    body: "Our care coordinator will contact you within one business day to schedule your first appointment and answer any questions.",
  },
  {
    step: "3",
    gradient: "from-indigo-500 to-violet-600",
    title: "Meet your clinician",
    body: "Attend your video appointment from anywhere. Your clinician will work with you to build a personalized care plan.",
  },
];

export default function HomePage() {
  // Rotating hero word
  const [wordIdx, setWordIdx] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setWordIdx((i) => (i + 1) % HERO_WORDS.length);
        setFadeIn(true);
      }, 320);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Hero — full-bleed video background, centered content */}
      <section className="relative bg-slate-950 min-h-screen flex items-center px-4 overflow-hidden">
        <VideoHero />
        <div className="relative z-10 w-full max-w-4xl mx-auto text-center py-32">
          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
            Mental health care,
            <br />
            <span
              className="bg-gradient-to-r from-teal-300 to-indigo-300 bg-clip-text text-transparent inline-block transition-all duration-300"
              style={{ opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(6px)" }}
            >
              {HERO_WORDS[wordIdx]}
            </span>
          </h1>
          <p className="mt-6 text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Tranquility Health provides compassionate, evidence-based medication management and psychotherapy for depression, anxiety, mood disorders, and more. Delivered via secure video appointments that fit your life.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={ROUTES.public.requestAppointment}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-teal-400 to-teal-500 text-white font-semibold rounded-xl hover:from-teal-500 hover:to-teal-600 transition-all shadow-lg hover:shadow-teal-500/30 text-base"
            >
              Request Appointment
            </Link>
            <Link
              href={ROUTES.public.services}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white/10 border border-white/25 text-white font-semibold rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm text-base"
            >
              Learn About Services
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center items-center gap-x-8 gap-y-3 overflow-x-auto">
          {[
            { src: "/icons/icon-shield-check.png", label: "Licensed Clinicians" },
            { src: "/icons/icon-lock.png",          label: "HIPAA-Conscious Platform" },
            { src: "/icons/icon-telehealth.png",    label: "Telehealth Appointments" },
            { src: "/icons/icon-scheduling.png",    label: "Flexible Payment Options" },
          ].map(({ src, label }) => (
            <span key={label} className="flex items-center gap-2.5 text-white/90 text-sm font-medium flex-shrink-0">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 p-1.5">
                <img src={src} alt="" className="w-full h-full object-contain" />
              </span>
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Why patients choose Tranquility Health</h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              We combine clinical expertise with technology to make quality mental health care genuinely accessible.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all duration-200 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-md ring-1 ring-slate-100/80 flex items-center justify-center mb-4 p-2.5">
                    <img src={f.iconSrc} alt="" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial — Designed for real life */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700/80 mb-4">Designed for real life</p>
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Getting care shouldn't feel like a second job.
            </h2>
            <p className="mt-5 text-lg text-slate-500 leading-relaxed">
              Between work, family, and everything else, carving out time for mental health support is hard. We built Tranquility Health around your schedule — not a clinic's.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                "Evening and weekend slots — see a provider after hours",
                "No commute, no waiting room — just you and your clinician",
                "Same-week availability for new patients",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-700">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-base leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden md:block">
            <img
              src="/services-therapy.png"
              alt="Telehealth care from home"
              className="rounded-3xl shadow-2xl w-full aspect-[4/3] object-cover"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
            <p className="mt-3 text-lg text-slate-500">Getting started takes less than 3 minutes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ step, gradient, title, body }, i) => (
              <Reveal key={step} delay={i * 120}>
                <div className="flex gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm h-full">
                  <div className={`flex-shrink-0 w-11 h-11 bg-gradient-to-br ${gradient} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm`}>
                    {step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-base mb-2">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-slate-50">
        <Reveal className="max-w-4xl mx-auto">
          <CtaBlock
            heading="Ready to take the first step?"
            subtext="Requesting an appointment takes less than 3 minutes. No commitment, no account required."
          />
        </Reveal>
      </section>
    </div>
  );
}
