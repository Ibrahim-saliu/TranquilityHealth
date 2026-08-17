import { Link } from "wouter";

interface CtaBlockProps {
  heading: string;
  subtext?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export function CtaBlock({
  heading,
  subtext,
  buttonLabel = "Book Appointment",
  buttonHref = "/request-appointment",
}: CtaBlockProps) {
  return (
    <div className="relative bg-teal-700 rounded-3xl px-8 py-14 text-center text-white overflow-hidden">
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full bg-teal-300 blur-2xl" />
      </div>
      <div className="relative">
        <h2 className="text-3xl font-bold leading-snug">{heading}</h2>
        {subtext && <p className="mt-4 text-teal-50/90 text-base max-w-xl mx-auto leading-relaxed">{subtext}</p>}
        <Link
          href={buttonHref}
          className="mt-8 inline-block px-8 py-3.5 bg-white text-teal-700 font-semibold rounded-xl hover:bg-teal-50 hover:text-teal-800 transition-all text-base shadow-lg hover:shadow-xl"
        >
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
}
