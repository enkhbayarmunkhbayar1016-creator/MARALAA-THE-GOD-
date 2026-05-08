export function Label({ className = "", children, ...props }) {
  return (
    <label
      className={`text-xs font-bold tracking-widest uppercase leading-none ${className}`}
      style={{ color: "#2dd4bf" }}
      {...props}
    >
      {children}
    </label>
  );
}
