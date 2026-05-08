export function Input({ className = "", type = "text", ...props }) {
  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-lg px-3 py-2 text-sm outline-none transition-all
        placeholder:text-slate-400
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}`}
      style={{
        background: "#f0fdfa",
        border: "1.5px solid #e2e8f0",
        color: "#042f2e",
      }}
      onFocus={e => e.target.style.borderColor = "#0d9488"}
      onBlur={e => e.target.style.borderColor = "#ccfbf1"}
      {...props}
    />
  );
}
