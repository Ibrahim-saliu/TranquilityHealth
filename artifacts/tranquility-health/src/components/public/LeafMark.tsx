/**
 * LeafMark — the Tranquility Health logomark ("a leaf on still water").
 * Single-color, inherits `currentColor`, so set the tone with a text-* class.
 */
export function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path d="M24 8C33 13 33 25 24 30 15 25 15 13 24 8Z" fill="currentColor" />
      <path d="M13 34.5Q24 38.5 35 34.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M17.5 38.5Q24 40.8 30.5 38.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
