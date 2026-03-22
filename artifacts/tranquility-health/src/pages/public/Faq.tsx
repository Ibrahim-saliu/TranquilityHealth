import { FaqItem } from "@/components/public/FaqItem";
import { CtaBlock } from "@/components/public/CtaBlock";

const faqs = [
  {
    question: "What is telehealth and how does it work?",
    answer: "Telehealth allows you to meet with a licensed mental health provider via secure video call — from the comfort of your home or any private location. Before your appointment you'll receive a link by email or text. Most devices work without any software downloads. You just need a stable internet connection and a private space.",
  },
  {
    question: "How does payment work? Do you accept insurance?",
    answer: "Tranquility Health is a cash-pay practice — we do not bill insurance directly. All services are paid out of pocket at the time of your appointment. We accept major credit and debit cards. If you have an HSA or FSA account, those funds can typically be used for mental health services. We can provide a superbill upon request that you may submit to your insurer for potential out-of-network reimbursement.",
  },
  {
    question: "What conditions do you treat?",
    answer: "We specialize in medication management and psychotherapy for depression, anxiety, mood disorders, sleep disorders, personality disorders, and schizophrenia. If you're unsure whether your situation is a good fit, just request an appointment and select 'Not sure yet' — our care coordinator will help determine the best starting point during your intake call.",
  },
  {
    question: "How do I request an appointment?",
    answer: "Fill out our short online appointment request form — it takes about 3 minutes. No account is required. Our care coordinator will contact you within one business day to schedule your first appointment and answer any questions you have.",
  },
  {
    question: "How long does the first appointment take?",
    answer: "Initial evaluations typically take 60 minutes. This gives your clinician time to learn about your history, current symptoms, and goals. Follow-up therapy sessions are usually 50 minutes, and medication management follow-ups are typically 20–30 minutes.",
  },
  {
    question: "Is my information kept private?",
    answer: "Yes. Tranquility Health is built on a HIPAA-conscious platform. All sessions are conducted over encrypted video connections. Your data is never sold or shared with third parties without your consent. We maintain strict access controls on all patient records.",
  },
  {
    question: "Do you offer same-day appointments?",
    answer: "We do our best to accommodate urgent needs. Same-day or next-day availability depends on clinician schedule. If you have an urgent (non-emergency) need, mention it when you request your appointment and we'll prioritize finding a slot.",
  },
  {
    question: "What if I'm in a mental health crisis?",
    answer: "If you are experiencing a mental health emergency, please call 988 (Suicide & Crisis Lifeline) or 911 immediately. Tranquility Health is not an emergency service and cannot guarantee immediate response.",
  },
  {
    question: "What states do you serve?",
    answer: "We currently serve patients in Texas. All of our clinicians hold active Texas licensure. If you live outside Texas, we are not able to see you at this time — telehealth regulations require clinicians to be licensed in the state where the patient is located.",
  },
  {
    question: "Can I use Tranquility Health if I've never been to therapy before?",
    answer: "Absolutely. Many of our patients are seeking mental health care for the first time. Our care coordinators are trained to make the intake process welcoming and clear, and your clinician will help you understand what to expect at every step.",
  },
];

export default function FaqPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-teal-50 to-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="mt-4 text-xl text-gray-500">
            Everything you need to know about getting started with Tranquility Health.
          </p>
        </div>
      </section>

      {/* FAQ list */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq) => (
            <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            Didn't find your answer?{" "}
            <a href="/contact" className="text-teal-600 hover:underline font-medium">
              Contact our care team
            </a>
            {" "}and we'll respond within one business day.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <CtaBlock
            heading="Ready to get started?"
            subtext="Request an appointment today — no account or commitment needed."
          />
        </div>
      </section>
    </div>
  );
}
