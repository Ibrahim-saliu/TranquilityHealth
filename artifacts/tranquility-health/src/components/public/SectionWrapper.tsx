import { ReactNode } from "react";

type SectionVariant = "white" | "slate" | "dark" | "gradient-subtle" | "brand" | "tint";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  tight?: boolean;
  variant?: SectionVariant;
}

// Section backgrounds are kept to a single brand family: white and slate for
// the neutral rhythm, a dark band for contrast, and two faint teal/indigo washes
// for the occasional accent. No competing warm hues.
const variantClasses: Record<SectionVariant, string> = {
  white: "bg-white",
  slate: "bg-slate-50",
  dark: "bg-slate-900",
  "gradient-subtle": "bg-gradient-to-br from-teal-50 to-indigo-50",
  brand: "bg-gradient-to-b from-teal-50/70 to-white",
  tint: "bg-gradient-to-b from-indigo-50/50 to-white",
};

export function SectionWrapper({
  children,
  className = "",
  tight = false,
  variant,
}: SectionWrapperProps) {
  const padding = tight ? "py-10" : "py-16";
  const bg = variant ? variantClasses[variant] : "";
  return (
    <section className={`${padding} ${bg} ${className}`.trim()}>
      {children}
    </section>
  );
}
