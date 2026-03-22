interface PageHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  badge?: string;
}

export function PageHeader({ title, subtitle, centered = false, badge }: PageHeaderProps) {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-indigo-900 py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-400 blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-500 blur-3xl translate-y-1/3 -translate-x-1/4" />
      </div>
      <div className={`relative max-w-4xl mx-auto ${centered ? "text-center" : ""}`}>
        {badge && (
          <span className="inline-block bg-white/10 border border-white/20 text-teal-200 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide mb-5">
            {badge}
          </span>
        )}
        <h1 className="text-4xl font-bold text-white leading-tight">{title}</h1>
        {subtitle && (
          <p className="mt-4 text-xl text-slate-300 leading-relaxed max-w-2xl">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
