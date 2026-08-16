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
    <div className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-indigo-600 rounded-3xl px-8 py-14 text-center text-white overflow-hidden">
      <div className="absolute inset-0 opacity-15">
        <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-indigo-200" />
        <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full bg-teal-200" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-white blur-2xl" />
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
