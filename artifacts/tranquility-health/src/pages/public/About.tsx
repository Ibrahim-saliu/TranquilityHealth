/**
 * About — /about
 *
 * Phase 0: Placeholder page for the About Us section.
 * TODO (future phase): Add mission statement, team bios, founding story.
 */

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-12">
      <h1 className="text-4xl font-bold text-gray-900">About Tranquility Health</h1>
      <p className="mt-4 text-lg text-gray-500">
        We believe everyone deserves access to quality mental health care.
      </p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-800">Our Mission</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Tranquility Health was founded with a simple belief: mental health support should
            be accessible, compassionate, and convenient. We remove barriers to care by
            delivering licensed therapy and psychiatric services directly to you — wherever you are.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800">Our Team</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            {/* TODO (future phase): Replace with actual team bios */}
            Our network of licensed mental health professionals includes therapists,
            counselors, and psychiatric nurse practitioners — all rigorously vetted
            and committed to evidence-based care.
          </p>
        </section>

        <div className="p-6 bg-teal-50 rounded-xl border border-teal-100">
          <p className="text-teal-800 text-sm font-medium">
            📋 Phase 0 — Placeholder content. Full About page coming in future phases.
          </p>
        </div>
      </div>
    </div>
  );
}
