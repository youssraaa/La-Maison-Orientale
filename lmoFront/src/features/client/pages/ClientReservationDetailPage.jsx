import { useCallback, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReservationCancelModal from "../../reservation/components/ReservationCancelModal";
import { cancelReservation } from "../../reservation/api/reservationManageApi";
import ClientFlashMessage from "../components/ClientFlashMessage";
import ClientPageShell from "../components/ClientPageShell";
import ClientStatusBadge from "../components/ClientStatusBadge";
import { IconCalendar } from "../components/ClientPortalIcons";
import { useClientPortal } from "../components/ClientPortalLayout";
import {
  formatDateTime,
  formatReservationDate,
  formatShortDate,
  isUpcomingReservation,
} from "../hooks/useClientAccountData";
import { findReservationByRef } from "../utils/clientPortalPaths";

function formatHeureLabel(heure) {
  const value = String(heure || "").slice(0, 5);
  if (!value) return "—";
  return value.replace(":", "h");
}

export default function ClientReservationDetailPage() {
  const { ref } = useParams();
  const { reservations, profile, refresh } = useClientPortal();
  const [flash, setFlash] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);

  const reservation = useMemo(
    () => findReservationByRef(reservations, ref),
    [reservations, ref]
  );

  const isCancelled = ["ANNULEE", "ANNULE"].includes(
    String(reservation?.statut || "").toUpperCase()
  );
  const upcoming = reservation ? isUpcomingReservation(reservation) : false;
  const canManage =
    Boolean(reservation?.gestionToken) &&
    (reservation.modifiable || reservation.cancellable) &&
    !isCancelled &&
    upcoming;
  const canCancel =
    reservation?.cancellable && reservation?.gestionToken && !isCancelled && upcoming;

  const handleCancelConfirm = useCallback(async () => {
    if (!reservation?.gestionToken) return;
    setCancelBusy(true);
    try {
      await cancelReservation(reservation.gestionToken);
      setCancelOpen(false);
      setFlash({
        tone: "success",
        message: `Votre réservation du ${formatShortDate(reservation.date)} a bien été annulée.`,
      });
      refresh?.();
    } catch (err) {
      setFlash({
        tone: "error",
        message: err.message || "Impossible d'annuler cette réservation.",
      });
    } finally {
      setCancelBusy(false);
    }
  }, [reservation, refresh]);

  if (!reservation) {
    return (
      <ClientPageShell
        pageClass="client-page--reservations"
        title="Réservation introuvable"
        lead="Réservation introuvable dans votre espace."
        icon={IconCalendar}
      >
        <div className="client-portal-empty client-portal-empty--action">
          <p>La réservation demandée est introuvable ou n'est plus liée à votre compte.</p>
          <Link to="/mon-compte/reservations" className="client-home__action client-home__action--primary">
            Retour à mes réservations
          </Link>
        </div>
      </ClientPageShell>
    );
  }

  const people = Number(reservation.nbPersonnes) || 0;
  const comment = String(reservation.commentaire || "").trim();

  return (
    <ClientPageShell
      pageClass="client-page--reservations"
      title={formatReservationDate(reservation.date)}
      icon={IconCalendar}
      lead={upcoming ? "Votre prochaine visite." : "Détail de votre visite passée."}
      action={
        <Link to="/mon-compte/reservations" className="client-home__action client-home__action--ghost">
          ← Mes réservations
        </Link>
      }
    >
      <ClientFlashMessage tone={flash?.tone || "success"} onDismiss={() => setFlash(null)}>
        {flash?.message}
      </ClientFlashMessage>

      <article className="client-detail-card">
        <header className="client-detail-card__head">
          <div>
            <p className="client-detail-card__kicker">Table au restaurant</p>
            <h2 className="client-detail-card__title">{formatReservationDate(reservation.date)}</h2>
            <p className="client-detail-card__ref">Réf. #{reservation.id || "—"}</p>
          </div>
          <ClientStatusBadge statut={reservation.statut} />
        </header>

        <dl className="client-detail-card__grid">
          <div>
            <dt>Heure</dt>
            <dd>{formatHeureLabel(reservation.heure)}</dd>
          </div>
          <div>
            <dt>Convives</dt>
            <dd>
              {people} personne{people > 1 ? "s" : ""}
            </dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatShortDate(reservation.date)}</dd>
          </div>
          <div>
            <dt>Au nom de</dt>
            <dd>{reservation.nomClient || "—"}</dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>{reservation.emailClient || profile?.email || "—"}</dd>
          </div>
          <div>
            <dt>Téléphone</dt>
            <dd>{reservation.telephoneClient || profile?.telephone || "—"}</dd>
          </div>
          {reservation.createdAt ? (
            <div className="client-detail-card__span2">
              <dt>Réservée le</dt>
              <dd>{formatDateTime(reservation.createdAt)}</dd>
            </div>
          ) : null}
        </dl>

        {comment ? (
          <section className="client-detail-card__note">
            <h3>Note</h3>
            <p>{comment}</p>
          </section>
        ) : null}

        <div className="client-detail-card__actions">
          {canManage ? (
            <Link
              to={`/reservation/gerer/${reservation.gestionToken}`}
              state={{ fromClientPortal: true }}
              className="client-home__action client-home__action--primary"
            >
              Modifier ou gérer
            </Link>
          ) : null}
          {canCancel ? (
            <button
              type="button"
              className="client-home__action client-home__action--danger"
              onClick={() => setCancelOpen(true)}
            >
              Annuler la réservation
            </button>
          ) : null}
          {!canManage && !canCancel ? (
            <p className="client-detail-card__hint">
              {isCancelled
                ? "Cette réservation a été annulée."
                : upcoming
                  ? "Pour toute modification, contactez le restaurant."
                  : "Cette réservation est terminée et ne peut plus être modifiée."}
            </p>
          ) : null}
        </div>
      </article>

      <ReservationCancelModal
        open={cancelOpen}
        busy={cancelBusy}
        nom={reservation.nomClient || profile?.nom}
        date={reservation.date}
        heure={reservation.heure}
        nbPersonnes={reservation.nbPersonnes}
        email={reservation.emailClient || profile?.email}
        onConfirm={handleCancelConfirm}
        onCancel={() => {
          if (!cancelBusy) setCancelOpen(false);
        }}
      />
    </ClientPageShell>
  );
}
