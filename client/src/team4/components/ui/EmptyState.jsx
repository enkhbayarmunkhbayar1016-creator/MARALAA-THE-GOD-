export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
          style={{ background: "#f0fdfa", color: "#99f6e4" }}>
          {icon}
        </div>
      )}
      {title && <h3 className="mb-1 text-base font-semibold" style={{ color: "#134e4a" }}>{title}</h3>}
      {description && <p className="mb-4 max-w-sm text-sm" style={{ color: "#99f6e4" }}>{description}</p>}
      {action}
    </div>
  );
}
