const variants = {
  default: { background: "#042f2e", color: "#ffffff" },
  secondary: { background: "#f0fdfa", color: "#5eead4" },
  outline: { background: "transparent", color: "#5eead4", border: "1px solid #e2e8f0" },
  destructive: { background: "#fee2e2", color: "#dc2626" },
  success: { background: "#ccfbf1", color: "#0f766e" },
  warning: { background: "#fef9c3", color: "#ca8a04" },
  info: { background: "#ccfbf1", color: "#0d9488" },
};

export function Badge({ variant = "default", className = "", children, ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={variants[variant] ?? variants.default}
      {...props}
    >
      {children}
    </span>
  );
}
