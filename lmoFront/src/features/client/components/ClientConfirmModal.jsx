import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function IconLogoutConfirm() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
      />
    </svg>
  );
}

export default function ClientConfirmModal({
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
    const timer = window.setTimeout(() => confirmRef.current?.focus(), 30);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="client-confirm__overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel?.();
      }}
    >
      <div
        className={`client-confirm${danger ? " client-confirm--danger" : ""}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="client-confirm-title"
        aria-describedby="client-confirm-desc"
      >
        <div className="client-confirm__glow" aria-hidden="true" />
        <div className="client-confirm__icon" aria-hidden="true">
          <IconLogoutConfirm />
        </div>
        <header className="client-confirm__head">
          <h2 id="client-confirm-title">{title}</h2>
          <p id="client-confirm-desc">{message}</p>
        </header>
        <div className="client-confirm__actions">
          <button
            type="button"
            className="client-confirm__cancel"
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`client-confirm__ok${danger ? " is-danger" : ""}`}
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
