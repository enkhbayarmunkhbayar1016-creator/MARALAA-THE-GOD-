import { Button } from "./Button";

export function ConfirmDialog({
  open,
  title = "Та устгахдаа итгэлтэй байна уу?",
  description = "Энэ үйлдлийг буцаах боломжгүй.",
  confirmText = "Үргэлжлүүлэх",
  cancelText = "Цуцлах",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(4,47,46,0.6)" }}>
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
        style={{ border: "1px solid #e2e8f0" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold" style={{ color: "#042f2e" }}>{title}</h3>
            <p className="mt-2 text-sm leading-6" style={{ color: "#2dd4bf" }}>{description}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 transition-colors"
            onMouseEnter={e => { e.currentTarget.style.background = "#f0fdfa"; e.currentTarget.style.color = "#5eead4"; }}
            onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "#99f6e4"; }}
          >
            ✕
          </button>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
