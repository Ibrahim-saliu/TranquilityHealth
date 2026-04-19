import { Link } from "wouter";
import { ROUTES } from "@/lib/config/routes";
import { CtaBlock } from "@/components/public/CtaBlock";
import { useState, useEffect, useRef } from "react";
import { ShieldCheck, Lock, Video, Coins, Wallet, CreditCard } from "lucide-react";

// ─── Scroll-reveal hook ────────────────────────────────────────────────────
function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

// ─── Count-up hook ─────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1600, shouldStart = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    let frame = 0;
    const totalFrames = Math.round(duration / 16);
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.min(Math.round(eased * target), target));
      if (frame >= totalFrames) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [shouldStart, target, duration]);
  return count;
}

// ─── Data ──────────────────────────────────────────────────────────────────
const HERO_WORDS = ["anywhere", "at home", "on your schedule"];

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
    ),
    gradient: "from-teal-500 to-teal-600",
    title: "Video Appointments",
    description: "Secure, HIPAA-conscious video sessions with licensed clinicians from the comfort of your home.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    gradient: "from-indigo-500 to-indigo-600",
    title: "Medication Management",
    description: "Expert psychiatric medication evaluation and ongoing management for depression, anxiety, mood disorders, and more.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    gradient: "from-violet-500 to-violet-600",
    title: "Psychotherapy",
    description: "Individual counseling sessions using evidence-based approaches tailored to your needs and goals.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    gradient: "from-teal-400 to-indigo-500",
    title: "Sleep & Mood Disorders",
    description: "Specialized care for sleep disorders, mood disorders, personality disorders, and schizophrenia.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-600",
    title: "New Patient Friendly",
    description: "First time seeking mental health care? We'll walk you through every step of the process.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    gradient: "from-indigo-400 to-violet-600",
    title: "Flexible Scheduling",
    description: "Evening and weekend availability designed to work around your schedule, not the other way around.",
  },
];

const testimonials = [
  {
    quote: "I was nervous about doing therapy over video, but honestly it's been so much easier than going in-person. My provider is incredibly thoughtful and really listens. I look forward to every session.",
    name: "Jamie M.",
    location: "Austin, TX",
    stars: 5,
  },
  {
    quote: "Getting my medication managed through Tranquility Health has been seamless. No insurance hassle, I know exactly what I'm paying, and I can be seen from home. It's been genuinely life-changing.",
    name: "Rachel T.",
    location: "Baltimore, MD",
    stars: 5,
  },
  {
    quote: "I finally found a practice that fits my schedule. Evening and Saturday slots mean I don't have to take time off work. The intake process was simple and the care coordinator was so helpful.",
    name: "Andre K.",
    location: "Bethesda, MD",
    stars: 5,
  },
];

export default function HomePage() {
  // ── Rotating hero word ──────────────────────────────────────────────────
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

  // ── Scroll-reveal refs ──────────────────────────────────────────────────
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollReveal();
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollReveal();
  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollReveal();

  // ── Count-up values (triggered when stats section enters view) ──────────
  const patientsCount = useCountUp(500, 1600, statsVisible);
  const sessionsCount = useCountUp(98, 1600, statsVisible);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-indigo-900 py-24 px-4 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-teal-400 blur-3xl -translate-y-1/2 translate-x-1/4 animate-blob" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-indigo-500 blur-3xl translate-y-1/3 -translate-x-1/4 animate-blob animation-delay-2000" />
        </div>
        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Mental health care,
              <br />
              <span
                className="bg-gradient-to-r from-teal-300 to-indigo-300 bg-clip-text text-transparent inline-block transition-all duration-300"
                style={{ opacity: fadeIn ? 1 : 0, transform: fadeIn ? "translateY(0)" : "translateY(6px)" }}
              >
                {HERO_WORDS[wordIdx]}
              </span>
            </h1>
            <p className="mt-6 text-xl text-slate-300 leading-relaxed">
              Tranquility Health provides compassionate, evidence-based medication management and psychotherapy for depression, anxiety, mood disorders, and more. Delivered via secure video appointments that fit your life.
            </p>
            {/* Cash-pay callout */}
            <div className="mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl px-4 py-3">
              <span className="flex items-center gap-1.5 text-sm text-teal-100 font-medium">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Coins className="w-3 h-3 text-teal-200" strokeWidth={1.75} />
                </span>
                No insurance required
              </span>
              <span className="w-px h-4 bg-white/20 hidden sm:block" />
              <span className="flex items-center gap-1.5 text-sm text-teal-100 font-medium">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Wallet className="w-3 h-3 text-teal-200" strokeWidth={1.75} />
                </span>
                Cash pay
              </span>
              <span className="w-px h-4 bg-white/20 hidden sm:block" />
              <span className="flex items-center gap-1.5 text-sm text-teal-100 font-medium">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <CreditCard className="w-3 h-3 text-teal-200" strokeWidth={1.75} />
                </span>
                HSA / FSA accepted
              </span>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
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
          <div className="hidden md:flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/30 to-indigo-500/30 rounded-3xl blur-xl scale-110" />
              <img
                src="/hero.png"
                alt="Person relaxing at home during a telehealth session"
                className="relative w-96 h-80 object-cover rounded-3xl shadow-2xl ring-1 ring-white/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-gradient-to-r from-teal-600 to-indigo-700 py-5">
        <div className="max-w-7xl mx-auto px-4 flex justify-center gap-8 text-white/90 text-sm font-medium overflow-x-auto">
          <span className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
              <ShieldCheck className="w-4 h-4 text-white" />
            </span>
            Licensed Clinicians
          </span>
          <span className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
              <Lock className="w-4 h-4 text-white" />
            </span>
            HIPAA-Conscious Platform
          </span>
          <span className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
              <Video className="w-4 h-4 text-white" />
            </span>
            Telehealth Appointments
          </span>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Why patients choose Tranquility Health</h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              We combine clinical expertise with technology to make quality mental health care genuinely accessible.
            </p>
          </div>
          <div ref={featuresRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-teal-200 transition-all duration-200 group"
                style={{
                  opacity: featuresVisible ? 1 : 0,
                  transform: featuresVisible ? "translateY(0)" : "translateY(24px)",
                  transition: `opacity 0.6s ease, transform 0.6s ease`,
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-4 shadow-sm`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial — Designed for real life */}
      <section className="py-20 px-4 bg-amber-50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700/70 mb-4">Designed for real life</p>
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
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
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

      {/* Stat counters */}
      <section className="py-16 px-4 bg-gradient-to-br from-slate-900 via-teal-900 to-indigo-900">
        <div ref={statsRef} className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            {
              value: `${patientsCount}+`,
              label: "Patients served",
              delay: 0,
            },
            {
              value: `${sessionsCount}%`,
              label: "Patient satisfaction",
              delay: 100,
            },
            {
              value: "< 3 min",
              label: "To request an appointment",
              delay: 200,
            },
            {
              value: "Same week",
              label: "Appointments available",
              delay: 300,
            },
          ].map(({ value, label, delay }) => (
            <div
              key={label}
              style={{
                opacity: statsVisible ? 1 : 0,
                transform: statsVisible ? "translateY(0)" : "translateY(20px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
                transitionDelay: `${delay}ms`,
              }}
            >
              <p className="text-4xl font-bold bg-gradient-to-r from-teal-300 to-indigo-300 bg-clip-text text-transparent">
                {value}
              </p>
              <p className="mt-2 text-sm text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
            <p className="mt-3 text-lg text-slate-500">Getting started takes less than 3 minutes.</p>
          </div>
          <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
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
            ].map(({ step, gradient, title, body }, i) => (
              <div
                key={step}
                className="flex gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm"
                style={{
                  opacity: stepsVisible ? 1 : 0,
                  transform: stepsVisible ? "translateY(0)" : "translateY(28px)",
                  transition: "opacity 0.65s ease, transform 0.65s ease",
                  transitionDelay: `${i * 120}ms`,
                }}
              >
                <div className={`flex-shrink-0 w-11 h-11 bg-gradient-to-br ${gradient} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm`}>
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-base mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50 overflow-hidden">
        <div className="text-center mb-12 px-4">
          <h2 className="text-3xl font-bold text-slate-900">What our patients say</h2>
          <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
            Real words from real patients.
          </p>
        </div>
        {/* Marquee track */}
        <div className="relative">
          <div className="flex gap-6 animate-marquee w-max">
            {[...testimonials, ...testimonials].map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 flex flex-col w-[340px] flex-shrink-0"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118L10 15.347l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.643 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-slate-600 text-sm leading-relaxed flex-1">
                  "{t.quote}"
                </blockquote>
                <div className="mt-5 flex items-center gap-3 pt-5 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-slate-50 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-50 to-transparent z-10" />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div
          ref={ctaRef}
          style={{
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.98)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <div className="max-w-4xl mx-auto">
            <CtaBlock
              heading="Ready to take the first step?"
              subtext="Requesting an appointment takes less than 3 minutes. No commitment, no account required."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
