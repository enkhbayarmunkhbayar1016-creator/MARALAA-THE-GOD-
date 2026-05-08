const variants = {
  default: { background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)", color: "#ffffff", border: "none" },
  outline: { background: "#ffffff", color: "#134e4a", border: "1px solid #e2e8f0" },
  ghost: { background: "transparent", color: "#134e4a", border: "none" },
  destructive: { background: "#dc2626", color: "#ffffff", border: "none" },
  link: { background: "transparent", color: "#0d9488", border: "none", padding: "0", height: "auto" },
};

const sizes = {
  default: "h-9 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-11 px-6 text-base",
  icon: "h-9 w-9 p-0",
};

export function Button({
  children,
  variant = "default",
  size = "default",
  className = "",
  loading = false,
  disabled,
  type = "button",
  ...props
}) {
  const variantStyle = variants[variant] ?? variants.default;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        disabled:pointer-events-none disabled:opacity-50
        ${sizes[size] ?? sizes.default}
        ${className}`}
      style={variantStyle}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
