export default function PageHeader({ icon: Icon, title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50">
            <Icon className="h-5 w-5 text-teal-600" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold" style={{ color: "#042f2e" }}>{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-teal-300">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}
