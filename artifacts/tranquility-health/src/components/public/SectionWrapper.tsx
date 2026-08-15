import { ReactNode } from "react";

type SectionVariant = "white" | "slate" | "dark" | "gradient-subtle" | "warm" | "amber";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  tight?: boolean;
  variant?: SectionVariant;
}

const variantClasses: Record<SectionVariant, string> = {
  white: "bg-white",
  slate: "bg-stone-50",
  dark: "bg-slate-900",
  "gradient-subtle": "bg-gradient-to-br from-teal-50 to-indigo-50",
  warm: "bg-gradient-to-b from-emerald-50 to-teal-50/30",
  amber: "bg-gradient-to-b from-amber-50 to-orange-50/20",
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
