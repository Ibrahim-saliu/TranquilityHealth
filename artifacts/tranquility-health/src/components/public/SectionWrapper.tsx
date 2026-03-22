import { ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  tight?: boolean;
}

export function SectionWrapper({ children, className = "", tight = false }: SectionWrapperProps) {
  return (
    <section className={`py-${tight ? "10" : "16"} ${className}`}>
      {children}
    </section>
  );
}
