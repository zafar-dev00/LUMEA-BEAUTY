export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-charcoal/50" onClick={onCancel} />
      <div className="relative bg-ivory w-full max-w-sm p-6 shadow-xl">
        <h2 className="text-lg text-charcoal font-medium">{title}</h2>
        {message && <p className="mt-2 text-sm text-charcoal-soft">{message}</p>}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs uppercase tracking-luxe text-charcoal-soft hover:text-charcoal transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs uppercase tracking-luxe text-ivory transition-colors ${
              danger ? "bg-rose-dark hover:bg-rose" : "bg-charcoal hover:bg-charcoal-soft"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
