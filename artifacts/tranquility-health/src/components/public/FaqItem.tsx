import { useState } from "react";

interface FaqItemProps {
  question: string;
  answer: string;
}

export function FaqItem({ question, answer }: FaqItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`border rounded-2xl overflow-hidden transition-colors ${open ? "border-teal-200 shadow-md" : "border-slate-200"}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-6 py-5 text-left transition-colors ${open ? "bg-teal-50" : "bg-white hover:bg-slate-50"}`}
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-slate-900 pr-4">{question}</span>
        <span className={`text-xl flex-shrink-0 font-light transition-transform ${open ? "text-teal-600 rotate-0" : "text-slate-400"}`}>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 bg-teal-50 border-t border-teal-100">
          <p className="text-slate-600 leading-relaxed text-sm pt-4">{answer}</p>
        </div>
      )}
    </div>
  );
}
