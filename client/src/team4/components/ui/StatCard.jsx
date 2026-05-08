export function StatCard({ title, value, icon, description, className = "" }) {
  return (
    <div
      className={`rounded-xl bg-white p-5 shadow-sm ${className}`}
      style={{ border: "1px solid #e2e8f0" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "#99f6e4" }}>
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold" style={{ color: "#042f2e" }}>
            {value ?? "—"}
          </p>
          {description && (
            <p className="mt-1 text-xs font-medium" style={{ color: "#0d9488" }}>
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
