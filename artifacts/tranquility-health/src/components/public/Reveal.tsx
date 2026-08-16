import type { ReactNode } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface RevealProps {
  children: ReactNode;
  /** Stagger delay in milliseconds, for revealing a sequence of items. */
  delay?: number;
  className?: string;
}

/**
 * A single, shared scroll-reveal wrapper: a gentle fade and rise the first time
 * the content enters the viewport. Used in place of hand-rolled inline reveal
 * logic so motion stays consistent across the site.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
