import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function formatDateFr(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("fr-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function ReservationModifySuccessModal({
  open,
  email,
  date,
  heure,
  nbPersonnes,
  onClose,
}) {
  const btnRef = useRef(null);
  const timeLabel = String(heure || "").slice(0, 5);
  const covers = Number(nbPersonnes) || 0;

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => btnRef.current?.focus(), 30);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="res-success-modal__overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className="res-success-modal res-success-modal--brand"
        role="dialog"
        aria-modal="true"
        aria-labelledby="res-success-modal-title"
        aria-describedby="res-success-modal-desc"
      >
        <header className="res-success-modal__hero">
          <span className="res-success-modal__hero-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
              <path
                d="M8 12.2l2.4 2.4L16 9"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h2 id="res-success-modal-title">Modification enregistrée</h2>
          <p id="res-success-modal-desc">Votre table a bien été actualisée.</p>
        </header>

        <div className="res-success-modal__body">
          <p className="res-success-modal__lead">
            Un e-mail récapitulatif vient de vous être adressé
            {email ? (
              <>
                {" "}
                à <strong>{email}</strong>
              </>
            ) : null}
            .
          </p>

          <dl className="res-success-modal__recap">
            <div>
              <dt>Date</dt>
              <dd>{formatDateFr(date)}</dd>
            </div>
            <div>
              <dt>Heure</dt>
              <dd>{timeLabel || "—"}</dd>
            </div>
            <div className="res-success-modal__recap-wide">
              <dt>Couverts</dt>
              <dd>
                {covers} personne{covers > 1 ? "s" : ""}
              </dd>
            </div>
          </dl>

          <button
            ref={btnRef}
            type="button"
            className="res-success-modal__btn"
            onClick={onClose}
          >
            Parfait, merci
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
