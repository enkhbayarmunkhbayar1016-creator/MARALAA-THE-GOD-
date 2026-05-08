const variantStyles = {
  default: { border: "1px solid #e2e8f0", background: "#f0fdfa", color: "#134e4a" },
  destructive: { border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626" },
  success: { border: "1px solid #bbf7d0", background: "#f0fdfa", color: "#0f766e" },
  warning: { border: "1px solid #fde68a", background: "#fffbeb", color: "#ca8a04" },
};

export function Alert({ variant = "default", className = "", children, ...props }) {
  return (
    <div
      role="alert"
      className={`relative w-full rounded-xl p-4 text-sm ${className}`}
      style={variantStyles[variant] ?? variantStyles.default}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ className = "", children, ...props }) {
  return (
    <h5 className={`mb-1 font-bold leading-none ${className}`} {...props}>
      {children}
    </h5>
  );
}

export function AlertDescription({ className = "", children, ...props }) {
  return (
    <div className={`text-sm leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
}
