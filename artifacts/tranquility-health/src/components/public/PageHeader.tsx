interface PageHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  badge?: string;
}

export function PageHeader({ title, subtitle, centered = false, badge }: PageHeaderProps) {
  return (
    <section className="relative bg-gradient-to-br from-stone-900 via-teal-900 to-violet-900 py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="absolute top-0 right-0 w-[560px] h-[560px] rounded-full bg-teal-300 blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-violet-400 blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-emerald-300/40 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>
      <div className={`relative max-w-4xl mx-auto ${centered ? "text-center" : ""}`}>
        {badge && (
          <span className="inline-block bg-white/10 border border-white/20 text-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-5">
            {badge}
          </span>
        )}
        <h1 className="text-4xl font-bold text-white leading-tight">{title}</h1>
        {subtitle && (
          <p className="mt-5 text-lg text-slate-300 leading-relaxed max-w-2xl">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
