import { useEffect } from "react";

const positions = {
  right: "right-0 top-0 h-full w-80",
  left: "left-0 top-0 h-full w-80",
  top: "top-0 left-0 w-full",
  bottom: "bottom-0 left-0 w-full",
};

export function Sheet({ open, onClose, side = "right", children }) {
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose?.(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" style={{ background: "rgba(4,47,46,0.6)" }} onClick={onClose} />
      <div
        className={`absolute bg-white shadow-2xl ${positions[side] ?? positions.right}`}
        style={{ borderLeft: side === "right" ? "1px solid #e2e8f0" : undefined }}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className = "", children, ...props }) {
  return <div className={`flex flex-col gap-1.5 p-6 ${className}`} style={{ borderBottom: "1px solid #f1f5f9" }} {...props}>{children}</div>;
}

export function SheetTitle({ className = "", children, ...props }) {
  return <h2 className={`text-lg font-bold ${className}`} style={{ color: "#042f2e" }} {...props}>{children}</h2>;
}

export function SheetContent({ className = "", children, ...props }) {
  return <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>;
}
