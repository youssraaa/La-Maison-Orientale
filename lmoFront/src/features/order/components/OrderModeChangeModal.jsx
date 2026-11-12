import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { formatPrice } from "../../menu/data/menuData";
import { getModeChangeCopy } from "../utils/orderModeRules";

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22">
      <path
        d="M12 3 2.5 20h19L12 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M12 9v5M12 17h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function ModeIcon({ mode }) {
  if (mode === "LIVRAISON") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22">
        <path
          d="M4 16h2.5a2.5 2.5 0 0 0 5 0H15a2.5 2.5 0 0 0 5 0H20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M3 16V8.5A1.5 1.5 0 0 1 4.5 7H14l3 3.5V16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="16" r="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="17" cy="16" r="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="22" height="22">
      <path
        d="M7 10V7a5 5 0 0 1 10 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M5 10h14l-1.2 9H6.2L5 10Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function OrderModeChangeModal({
  open,
  targetMode,
  cartItems = [],
  incompatibleItems = [],
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);
  const hasIncompatibleItems = incompatibleItems.length > 0;
  const copy = getModeChangeCopy(targetMode, hasIncompatibleItems);
  const incompatibleIds = new Set(
    incompatibleItems.map((item) => item.lineId || item.platId)
  );

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") onCancel?.();
    };

    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => confirmRef.current?.focus(), 30);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return createPortal(
    <div
      className="order-mode-modal__overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel?.();
      }}
    >
      <div
        className={`order-mode-modal order-mode-modal--${targetMode === "LIVRAISON" ? "delivery" : "pickup"}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="order-mode-modal-title"
        aria-describedby="order-mode-modal-body"
      >
        <header className="order-mode-modal__head">
          <div className="order-mode-modal__head-icon" aria-hidden="true">
            <ModeIcon mode={targetMode} />
          </div>
          <div className="order-mode-modal__head-copy">
            <p className="order-mode-modal__mode">{copy.modeLabel}</p>
            <h2 id="order-mode-modal-title" className="order-mode-modal__title">
              {copy.title}
            </h2>
          </div>
          <button
            type="button"
            className="order-mode-modal__close"
            onClick={onCancel}
            aria-label="Fermer"
          >
            ×
          </button>
        </header>

        <div id="order-mode-modal-body" className="order-mode-modal__message">
          <div className="order-mode-modal__warning" role="alert">
            <span className="order-mode-modal__warning-icon" aria-hidden="true">
              <WarningIcon />
            </span>
            <p>{copy.warning}</p>
          </div>
          {copy.body ? <p className="order-mode-modal__note">{copy.body}</p> : null}
        </div>

        {cartItems.length > 0 ? (
          <div className="order-mode-modal__cart">
            <p className="order-mode-modal__cart-label">{copy.listLabel}</p>
            <ul className="order-mode-modal__list">
              {cartItems.map((item) => {
                const isIncompatible = incompatibleIds.has(item.lineId || item.platId);
                return (
                  <li
                    key={item.lineId || item.platId}
                    className={`order-mode-modal__item${
                      isIncompatible ? " order-mode-modal__item--removed" : ""
                    }`}
                  >
                    <div className="order-mode-modal__item-main">
                      <span>{item.nom || item.name}</span>
                      {item.quantite > 1 ? (
                        <em className="order-mode-modal__item-qty">× {item.quantite}</em>
                      ) : null}
                      {isIncompatible ? (
                        <small className="order-mode-modal__item-badge">Sera retiré</small>
                      ) : null}
                    </div>
                    <strong>{formatPrice(item.prix * item.quantite)}</strong>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <div className="order-mode-modal__actions">
          <button
            ref={confirmRef}
            type="button"
            className="order-mode-modal__confirm"
            onClick={onConfirm}
          >
            {copy.confirm}
          </button>
          <button type="button" className="order-mode-modal__cancel" onClick={onCancel}>
            Annuler
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
