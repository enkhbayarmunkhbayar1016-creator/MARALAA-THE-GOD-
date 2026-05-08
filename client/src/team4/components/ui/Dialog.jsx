import { useEffect, useRef } from "react";

export function Dialog({ open, onClose, children }) {
  const overlayRef = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose?.(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(4,47,46,0.6)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl" style={{ border: "1px solid #e2e8f0" }}>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className = "", children, ...props }) {
  return <div className={`flex flex-col gap-1.5 p-6 pb-0 ${className}`} {...props}>{children}</div>;
}

export function DialogTitle({ className = "", children, ...props }) {
  return <h2 className={`text-lg font-bold ${className}`} style={{ color: "#042f2e" }} {...props}>{children}</h2>;
}

export function DialogDescription({ className = "", children, ...props }) {
  return <p className={`text-sm ${className}`} style={{ color: "#99f6e4" }} {...props}>{children}</p>;
}

export function DialogContent({ className = "", children, ...props }) {
  return <div className={`p-6 ${className}`} {...props}>{children}</div>;
}

export function DialogFooter({ className = "", children, ...props }) {
  return (
    <div className={`flex flex-col-reverse gap-2 p-6 pt-0 sm:flex-row sm:justify-end ${className}`} {...props}>
      {children}
    </div>
  );
}
