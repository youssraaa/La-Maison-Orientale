import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { restaurantInfo } from "../../../common/data/restaurantInfo";
import { fetchReservationByToken } from "../../reservation/api/reservationManageApi";
import useReservationPolicy from "../../reservation/hooks/useReservationPolicy";
import ClientStatusBadge from "./ClientStatusBadge";
import {
  formatDateTime,
  formatReservationDate,
  formatShortDate,
  isUpcomingReservation,
} from "../hooks/useClientAccountData";

function formatHeureLabel(heure) {
  const value = String(heure || "").slice(0, 5);
  if (!value) return "—";
  return value.replace(":", "h");
}

export default function ClientReservationDetailModal({
  open,
  reservation,
  profile,
  onClose,
}) {
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const { policy } = useReservationPolicy();
  const maxOnlineCovers = policy.maxOnlineCovers;

  const [liveReservation, setLiveReservation] = useState(null);
  const [loading, setLoading] = useState(false);

  const reservationId = reservation?.id;
  const reservationToken = reservation?.gestionToken;

  useEffect(() => {
    if (!open || !reservation) return undefined;

    setLiveReservation(reservation);

    if (!reservationToken) return undefined;

    let cancelled = false;
    setLoading(true);

    fetchReservationByToken(reservationToken)
      .then((data) => {
        if (!cancelled) setLiveReservation(data);
      })
      .catch(() => {
        if (!cancelled) setLiveReservation(reservation);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, reservationId, reservationToken]);

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

  const current = liveReservation || reservation;
  if (!open || !current) return null;

  const isCancelled = ["ANNULEE", "ANNULE"].includes(String(current?.statut || "").toUpperCase());
  const upcoming = isUpcomingReservation(current);
  const canModify = Boolean(current?.modifiable && reservationToken && !isCancelled && upcoming);
  const canCancel = Boolean(current?.cancellable && reservationToken && !isCancelled && upcoming);
  const phoneCancelOnly =
    upcoming && !isCancelled && !canModify && Number(current?.nbPersonnes) > maxOnlineCovers;

  const people = Number(current.nbPersonnes) || 0;
  const comment = String(current.commentaire || "").trim();

  return createPortal(
    <div
      className="client-res-modal__overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current?.();
      }}
    >
      <div
        className="client-res-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-res-modal-title"
      >
        <header className="client-res-modal__head">
          <div>
            <p className="client-res-modal__kicker">
              {upcoming && !isCancelled ? "Réservation à venir" : "Réservation passée"}
            </p>
            <h2 id="client-res-modal-title">Détails de la réservation</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="client-res-modal__close"
            aria-label="Fermer"
            onClick={() => onCloseRef.current?.()}
          >
            ×
          </button>
        </header>

        <div className="client-res-modal__body">
          {loading ? <p className="client-res-modal__loading">Chargement…</p> : null}

          <div className="client-res-modal__summary">
            <div>
              <h3>{formatReservationDate(current.date)}</h3>
              <p>Réf. #{current.id || "—"}</p>
            </div>
            <ClientStatusBadge statut={current.statut} />
          </div>

          <dl className="client-res-modal__grid">
            <div>
              <dt>Heure</dt>
              <dd>{formatHeureLabel(current.heure)}</dd>
            </div>
            <div>
              <dt>Convives</dt>
              <dd>
                {people} personne{people > 1 ? "s" : ""}
              </dd>
            </div>
            <div>
              <dt>Date</dt>
              <dd>{formatShortDate(current.date)}</dd>
            </div>
            <div>
              <dt>Au nom de</dt>
              <dd>{current.nomClient || "—"}</dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>{current.emailClient || profile?.email || "—"}</dd>
            </div>
            <div>
              <dt>Téléphone</dt>
              <dd>{current.telephoneClient || profile?.telephone || "—"}</dd>
            </div>
            {current.createdAt ? (
              <div className="client-res-modal__span2">
                <dt>Réservée le</dt>
                <dd>{formatDateTime(current.createdAt)}</dd>
              </div>
            ) : null}
          </dl>

          {comment ? (
            <section className="client-res-modal__note">
              <h4>Note</h4>
              <p>{comment}</p>
            </section>
          ) : null}

          {phoneCancelOnly ? (
            <p className="client-res-modal__hint">
              Pour modifier ou annuler un groupe de plus de {maxOnlineCovers} personnes, appelez le
              restaurant au{" "}
              <a href={restaurantInfo.phone.href}>{restaurantInfo.phone.display}</a>.
            </p>
          ) : null}
          {!canModify && !canCancel && !phoneCancelOnly ? (
            <p className="client-res-modal__hint">
              {isCancelled
                ? "Cette réservation a été annulée."
                : upcoming
                  ? "Cette réservation ne peut plus être modifiée en ligne."
                  : "Cette visite est terminée."}
            </p>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
