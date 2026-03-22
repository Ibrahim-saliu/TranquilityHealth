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
    <div className="bg-teal-700 rounded-2xl px-8 py-12 text-center text-white">
      <h2 className="text-3xl font-bold">{heading}</h2>
      {subtext && <p className="mt-3 text-teal-100 text-lg max-w-xl mx-auto">{subtext}</p>}
      <Link
        href={buttonHref}
        className="mt-8 inline-block px-8 py-3 bg-white text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition-colors text-base"
      >
        {buttonLabel}
      </Link>
    </div>
  );
}
