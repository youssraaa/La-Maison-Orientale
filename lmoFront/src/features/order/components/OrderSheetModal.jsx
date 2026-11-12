import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function OrderSheetModal({ open, title, children, onClose, onSave, saveLabel = "Enregistrer", busy = false }) {
  const saveRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape" && !busy) onClose?.();
    };

    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => saveRef.current?.focus(), 40);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="order-sheet__overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose?.();
      }}
    >
      <div className="order-sheet" role="dialog" aria-modal="true" aria-labelledby="order-sheet-title">
        <div className="order-sheet__handle" aria-hidden="true" />
        <h2 id="order-sheet-title" className="order-sheet__title">
          {title}
        </h2>
        <div className="order-sheet__body">{children}</div>
        <div className="order-sheet__actions">
          <button type="button" className="order-sheet__btn order-sheet__btn--ghost" onClick={onClose} disabled={busy}>
            Annuler
          </button>
          <button
            ref={saveRef}
            type="button"
            className="order-sheet__btn order-sheet__btn--primary"
            onClick={onSave}
            disabled={busy}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
