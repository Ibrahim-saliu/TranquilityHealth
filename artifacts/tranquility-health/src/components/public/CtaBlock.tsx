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
    <div className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-indigo-700 rounded-3xl px-8 py-14 text-center text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white" />
        <div className="absolute -bottom-16 -left-10 w-80 h-80 rounded-full bg-indigo-300" />
      </div>
      <div className="relative">
        <h2 className="text-3xl font-bold">{heading}</h2>
        {subtext && <p className="mt-3 text-teal-100 text-lg max-w-xl mx-auto leading-relaxed">{subtext}</p>}
        <Link
          href={buttonHref}
          className="mt-8 inline-block px-8 py-3.5 bg-gradient-to-r from-white to-teal-50 text-teal-700 font-semibold rounded-xl hover:from-teal-50 hover:to-indigo-50 hover:text-indigo-700 transition-all text-base shadow-lg hover:shadow-xl"
        >
          {buttonLabel}
        </Link>
      </div>
    </div>
  );
}
