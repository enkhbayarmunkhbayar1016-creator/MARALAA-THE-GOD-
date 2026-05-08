import { createContext, useCallback, useContext, useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from "react-icons/fi";

const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: FiCheckCircle,   bg: "#f0fdfa", border: "#99f6e4", text: "#0f766e", bar: "#0d9488" },
  error:   { icon: FiAlertCircle,   bg: "#fef2f2", border: "#fecaca", text: "#dc2626", bar: "#ef4444" },
  warning: { icon: FiAlertTriangle, bg: "#fffbeb", border: "#fde68a", text: "#ca8a04", bar: "#f59e0b" },
  info:    { icon: FiInfo,          bg: "#f0fdfa", border: "#99f6e4", text: "#0d9488", bar: "#3b82f6" },
};

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, variant = "info", duration = 4000) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, variant, duration }]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const toast = useCallback((message, opts = {}) => {
    addToast(message, opts.variant || "info", opts.duration ?? 4000);
  }, [addToast]);

  toast.success = (msg, opts) => addToast(msg, "success", opts?.duration ?? 4000);
  toast.error   = (msg, opts) => addToast(msg, "error",   opts?.duration ?? 5000);
  toast.warning = (msg, opts) => addToast(msg, "warning", opts?.duration ?? 4000);
  toast.info    = (msg, opts) => addToast(msg, "info",    opts?.duration ?? 4000);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const v = VARIANTS[t.variant] || VARIANTS.info;
          const Icon = v.icon;
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg"
              style={{ background: v.bg, border: `1px solid ${v.border}` }}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: v.text }} />
              <p className="flex-1 text-sm font-semibold" style={{ color: v.text }}>{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
