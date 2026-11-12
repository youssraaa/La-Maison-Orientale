import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import ClientStatusBadge from "./ClientStatusBadge";
import { formatDateTime } from "../hooks/useClientAccountData";

export default function ClientMessageExchangeModal({ open, message, onClose }) {
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") onCloseRef.current?.();
    };

    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => closeRef.current?.focus(), 30);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open]);

  if (!open || !message) return null;

  return createPortal(
    <div
      className="client-res-modal__overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current?.();
      }}
    >
      <div
        className="client-res-modal client-res-modal--message"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-message-modal-title"
      >
        <header className="client-res-modal__head">
          <div>
            <p className="client-res-modal__kicker">Demande #{message.id}</p>
            <h2 id="client-message-modal-title">{message.sujet || "Sans sujet"}</h2>
            <p className="client-message-detail__meta">{formatDateTime(message.createdAt)}</p>
          </div>
          <div className="client-res-modal__head-actions">
            <ClientStatusBadge statut={message.statut} />
            <button
              ref={closeRef}
              type="button"
              className="client-res-modal__close"
              aria-label="Fermer"
              onClick={() => onCloseRef.current?.()}
            >
              ×
            </button>
          </div>
        </header>

        <div className="client-res-modal__body client-message-detail__body">
          <div className="client-message-detail__block">
            <p className="client-message-detail__label">Votre message</p>
            <p>{message.message}</p>
          </div>

          {message.reponse ? (
            <div className="client-message-detail__block client-message-detail__block--reply">
              <p className="client-message-detail__label">
                Réponse du restaurant
                {message.reponseAt ? ` · ${formatDateTime(message.reponseAt)}` : ""}
              </p>
              <p>{message.reponse}</p>
            </div>
          ) : message.statut === "NOUVELLE" ? (
            <p className="client-message-detail__reply client-message-detail__reply--pending">
              Notre équipe traite votre demande. Vous serez prévenu dans Mes notifications.
            </p>
          ) : message.reponseAt ? (
            <p className="client-message-detail__reply">
              Le restaurant a répondu le {formatDateTime(message.reponseAt)}. Consultez aussi votre e-mail.
            </p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
