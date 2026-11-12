import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function IconDanger() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
      />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
      />
    </svg>
  );
}

function AdminConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape" && !busy) onCancel?.();
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => confirmRef.current?.focus(), 30);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="admin-confirm__overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel?.();
      }}
    >
      <div
        className={`admin-confirm${danger ? " admin-confirm--danger" : ""}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        aria-describedby="admin-confirm-desc"
      >
        <div className="admin-confirm__glow" aria-hidden="true" />
        <div className="admin-confirm__icon" aria-hidden="true">
          {danger ? <IconDanger /> : <IconInfo />}
        </div>
        <header className="admin-confirm__head">
          <h2 id="admin-confirm-title">{title}</h2>
          <p id="admin-confirm-desc">{message}</p>
        </header>
        <div className="admin-confirm__actions">
          <button
            type="button"
            className="admin-confirm__cancel"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`admin-confirm__ok${danger ? " is-danger" : ""}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Patientez…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default AdminConfirmModal;
