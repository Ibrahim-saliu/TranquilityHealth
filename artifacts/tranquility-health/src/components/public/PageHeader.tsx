interface PageHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export function PageHeader({ title, subtitle, centered = false }: PageHeaderProps) {
  return (
    <div className={`mb-12 ${centered ? "text-center" : ""}`}>
      <h1 className="text-4xl font-bold text-gray-900 leading-tight">{title}</h1>
      {subtitle && (
        <p className="mt-4 text-xl text-gray-500 leading-relaxed max-w-2xl">{subtitle}</p>
      )}
    </div>
  );
}
