import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function formatDateFr(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("fr-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ReservationCancelModal({
  open,
  busy = false,
  loadingDetails = false,
  error = "",
  nom,
  date,
  heure,
  nbPersonnes,
  email,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);
  const timeLabel = String(heure || "").slice(0, 5);
  const covers = Number(nbPersonnes) || 0;

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
      className="res-cancel-modal__overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel?.();
      }}
    >
      <div
        className="res-cancel-modal res-cancel-modal--brand"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="res-cancel-modal-title"
        aria-describedby="res-cancel-modal-note"
      >
        <header className="res-cancel-modal__hero">
          <span className="res-cancel-modal__hero-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M6 8h12l-1 12H7L6 8Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M9 8V6h6v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M10 12h4M10 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <h2 id="res-cancel-modal-title">Annuler cette réservation ?</h2>
        </header>

        <div className="res-cancel-modal__body">
          <p className="res-cancel-modal__note" id="res-cancel-modal-note">
            Cette réservation sera définitivement annulée et ne pourra pas être rétablie.
            Vous pourrez toujours réserver une nouvelle table en ligne.
          </p>

          {error ? (
            <p className="res-cancel-modal__error" role="alert">
              {error}
            </p>
          ) : null}

          <dl className="res-cancel-modal__details">
            <div>
              <dt>Client</dt>
              <dd>{nom || "—"}</dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{formatDateFr(date)}</dd>
            </div>
            <div>
              <dt>Heure</dt>
              <dd>{timeLabel || "—"}</dd>
            </div>
            <div>
              <dt>Couverts</dt>
              <dd>
                {covers} personne{covers > 1 ? "s" : ""}
              </dd>
            </div>
            {email ? (
              <div className="res-cancel-modal__detail-wide">
                <dt>E-mail</dt>
                <dd>{email}</dd>
              </div>
            ) : null}
          </dl>

          {loadingDetails ? (
            <p className="res-cancel-modal__loading">Mise à jour des informations…</p>
          ) : null}

          <div className="res-cancel-modal__actions">
            <button
              type="button"
              className="res-cancel-modal__btn res-cancel-modal__btn--keep"
              onClick={onCancel}
              disabled={busy}
            >
              Garder ma table
            </button>
            <button
              ref={confirmRef}
              type="button"
              className="res-cancel-modal__btn res-cancel-modal__btn--confirm"
              onClick={onConfirm}
              disabled={busy}
            >
              {busy ? "Annulation…" : "Confirmer l'annulation"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
