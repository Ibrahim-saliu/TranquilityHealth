import { FaqItem } from "@/components/public/FaqItem";
import { CtaBlock } from "@/components/public/CtaBlock";
import { PageHeader } from "@/components/public/PageHeader";
import { SectionWrapper } from "@/components/public/SectionWrapper";

const faqCategories = [
  {
    category: "Getting Started",
    items: [
      {
        question: "What is telehealth and how does it work?",
        answer:
          "Telehealth allows you to meet with a licensed mental health provider via secure video call, from the comfort of your home or any private location. Before your appointment you'll receive a link by email or text. Most devices work without any software downloads. You just need a stable internet connection and a private space.",
      },
      {
        question: "How do I request an appointment?",
        answer:
          "Fill out our short online appointment request form. It takes about 3 minutes and no account is required. Our care coordinator will contact you within one business day to schedule your first appointment and answer any questions you have.",
      },
      {
        question: "How long does the first appointment take?",
        answer:
          "Initial evaluations typically take 60 minutes. This gives your clinician time to learn about your history, current symptoms, and goals. Follow-up therapy sessions are usually 50 minutes, and medication management follow-ups are typically 20–30 minutes.",
      },
      {
        question: "Can I use Tranquility Health if I've never been to therapy before?",
        answer:
          "Absolutely. Many of our patients are seeking mental health care for the first time. Our care coordinators are trained to make the intake process welcoming and clear, and your clinician will help you understand what to expect at every step.",
      },
    ],
  },
  {
    category: "Payments & Insurance",
    items: [
      {
        question: "Do you accept insurance?",
        answer:
          "Yes — Tranquility Health accepts insurance. We also welcome patients who prefer to pay directly: we accept major credit and debit cards, and HSA/FSA funds can typically be used for mental health services. If you'd like to seek out-of-network reimbursement from your insurer, we can provide a Superbill upon request. Our care team is happy to walk you through your options when you schedule.",
      },
    ],
  },
  {
    category: "Our Services",
    items: [
      {
        question: "What conditions do you treat?",
        answer:
          "We specialize in medication management and psychotherapy for depression, anxiety, mood disorders, sleep disorders, personality disorders, and schizophrenia. If you're unsure whether your situation is a good fit, just request an appointment and select 'Not sure yet.' Our care coordinator will help determine the best starting point during your intake call.",
      },
      {
        question: "Do you offer same-day appointments?",
        answer:
          "We do our best to accommodate urgent needs. Same-day or next-day availability depends on clinician schedule. If you have an urgent (non-emergency) need, mention it when you request your appointment and we'll prioritize finding a slot.",
      },
      {
        question: "What states do you serve?",
        answer:
          "We currently serve patients in Texas and Maryland. Our clinician holds active licensure in both states. If you are located outside of Texas or Maryland at the time of your appointment, we are not able to see you, as telehealth regulations require clinicians to be licensed in the state where the patient is physically located.",
      },
    ],
  },
  {
    category: "Privacy & Safety",
    items: [
      {
        question: "Is my information kept private?",
        answer:
          "Yes. Tranquility Health is built on a HIPAA-conscious platform. All sessions are conducted over encrypted video connections. Your data is never sold or shared with third parties without your consent. We maintain strict access controls on all patient records.",
      },
      {
        question: "What if I'm in a mental health crisis?",
        answer:
          "If you are experiencing a mental health emergency, please call 988 (Suicide & Crisis Lifeline) or 911 immediately. Tranquility Health is not an emergency service and cannot guarantee immediate response.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div>
      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about getting started with Tranquility Health."
        badge="Common Questions"
      />

      <SectionWrapper variant="warm" tight>
        <div className="max-w-3xl mx-auto px-4">
          <div className="rounded-2xl overflow-hidden shadow-sm">
            <img src="/faq-header.png" alt="A calm space for your questions" className="w-full h-52 object-cover" />
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="warm">
        <div className="max-w-3xl mx-auto px-4 space-y-10">
          {faqCategories.map((group) => (
            <div key={group.category}>
              <h2 className="text-xl font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-200">
                {group.category}
              </h2>
              <div className="space-y-3">
                {group.items.map((faq) => (
                  <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper variant="amber" tight>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            Didn't find your answer?{" "}
            <a href="/contact" className="text-teal-600 hover:text-teal-700 hover:underline font-medium">
              Contact our care team
            </a>
            {" "}and we'll respond within one business day.
          </p>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="slate" tight>
        <div className="max-w-3xl mx-auto px-4">
          <CtaBlock
            heading="Ready to get started?"
            subtext="Request an appointment today. No account or commitment needed."
          />
        </div>
      </SectionWrapper>
    </div>
  );
}
