import { useEffect, useRef, useState } from "react";

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      {typeof children === "function" ? children({ open, setOpen }) : children}
    </div>
  );
}

export function DropdownMenuTrigger({ children, onClick, ...props }) {
  return <div onClick={onClick} {...props}>{children}</div>;
}

export function DropdownMenuContent({ open, className = "", children, ...props }) {
  if (!open) return null;
  return (
    <div
      className={`absolute right-0 z-50 mt-2 min-w-[8rem] overflow-hidden rounded-xl bg-white shadow-xl ${className}`}
      style={{ border: "1px solid #e2e8f0" }}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ className = "", children, onClick, ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors ${className}`}
      style={{ color: "#134e4a" }}
      onMouseEnter={e => e.currentTarget.style.background = "#f0fdfa"}
      onMouseLeave={e => e.currentTarget.style.background = ""}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({ className = "" }) {
  return <div className={`my-1 h-px ${className}`} style={{ background: "#f0fdfa" }} />;
}

export function DropdownMenuLabel({ className = "", children, ...props }) {
  return (
    <div
      className={`px-3 py-2 text-xs font-semibold ${className}`}
      style={{ color: "#2dd4bf" }}
      {...props}
    >
      {children}
    </div>
  );
}
