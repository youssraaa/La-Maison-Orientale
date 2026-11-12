import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useClientPortal } from "../components/ClientPortalLayout";
import ClientFlashMessage from "../components/ClientFlashMessage";
import ClientListPagination from "../components/ClientListPagination";
import ClientListToolbar from "../components/ClientListToolbar";
import ClientPageShell from "../components/ClientPageShell";
import ClientReservationCancelModal from "../components/ClientReservationCancelModal";
import ClientReservationDetailModal from "../components/ClientReservationDetailModal";
import ClientReservationModifyModal from "../components/ClientReservationModifyModal";
import ClientStatusBadge from "../components/ClientStatusBadge";
import { IconEdit, IconEye, IconTrash, IconCalendar } from "../components/ClientPortalIcons";
import { useClientListControls } from "../hooks/useClientListControls";
import { formatReservationDate, formatShortDate, isUpcomingReservation } from "../hooks/useClientAccountData";

function reservationTimestamp(reservation) {
  const time = String(reservation.heure || "00:00").slice(0, 5);
  return new Date(`${reservation.date}T${time}:00`).getTime();
}

function formatHeureLabel(heure) {
  const value = String(heure || "").slice(0, 5);
  if (!value) return "—";
  return value.replace(":", "h");
}

function canModifyReservation(reservation) {
  return Boolean(
    reservation?.modifiable &&
      reservation?.gestionToken &&
      isUpcomingReservation(reservation)
  );
}

function canCancelReservation(reservation) {
  return Boolean(
    reservation?.cancellable &&
      reservation?.gestionToken &&
      isUpcomingReservation(reservation)
  );
}

function filterReservation(reservation, query) {
  const haystack = [
    String(reservation.id),
    formatReservationDate(reservation.date),
    formatShortDate(reservation.date),
    reservation.statut,
    String(reservation.nbPersonnes),
    reservation.commentaire,
    reservation.nomClient,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function ReservationRowActions({ reservation, onDetail, onModify, onCancel }) {
  const showModify = canModifyReservation(reservation);
  const showCancel = canCancelReservation(reservation);

  return (
    <div
      className="client-table__action-group client-table__action-group--labeled"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="client-table__icon-btn client-table__icon-btn--view client-table__icon-btn--labeled"
        title="Voir les détails"
        aria-label="Voir les détails de la réservation"
        onClick={(event) => {
          event.stopPropagation();
          onDetail(reservation);
        }}
      >
        <IconEye />
        <span>Détails</span>
      </button>
      {showModify ? (
        <button
          type="button"
          className="client-table__icon-btn client-table__icon-btn--edit client-table__icon-btn--labeled"
          title="Modifier la réservation"
          aria-label="Modifier la réservation"
          onClick={(event) => {
            event.stopPropagation();
            onModify(reservation);
          }}
        >
          <IconEdit />
          <span>Modifier</span>
        </button>
      ) : null}
      {showCancel ? (
        <button
          type="button"
          className="client-table__icon-btn client-table__icon-btn--danger client-table__icon-btn--labeled"
          title="Annuler la réservation"
          aria-label="Annuler la réservation"
          onClick={(event) => {
            event.stopPropagation();
            onCancel(reservation);
          }}
        >
          <IconTrash />
          <span>Annuler</span>
        </button>
      ) : null}
    </div>
  );
}

export default function ClientReservationsPage() {
  const { reservations, profile, refresh } = useClientPortal();
  const [flash, setFlash] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const sorted = useMemo(
    () => [...reservations].sort((a, b) => reservationTimestamp(b) - reservationTimestamp(a)),
    [reservations]
  );

  const list = useClientListControls(sorted, {
    filterFn: filterReservation,
    defaultPageSize: 10,
  });

  function openModal(reservation, mode) {
    if (!reservation) return;
    setActiveModal({ mode, reservation: { ...reservation } });
  }

  function closeModal() {
    setActiveModal(null);
  }

  const handleModalSuccess = useCallback((message) => {
    setFlash(message);
    refresh?.();
  }, [refresh]);

  const newReservationLink = (
    <Link
      to="/reservation"
      className="client-home__action client-home__action--primary client-reservations__new-btn"
    >
      <span className="client-reservations__new-icon" aria-hidden="true">
        +
      </span>
      Nouvelle réservation
    </Link>
  );

  return (
    <ClientPageShell
      pageClass="client-page--reservations"
      title="Mes réservations"
      lead="Consultez, modifiez ou annulez vos tables."
      icon={IconCalendar}
    >
      <ClientFlashMessage tone={flash?.tone || "success"} onDismiss={() => setFlash(null)}>
        {flash?.message}
      </ClientFlashMessage>

      <section className="client-portal-block client-portal-block--flush">
        <div className="client-portal-block__head">
          <h3>Liste des réservations</h3>
          {newReservationLink}
        </div>

        <ClientListToolbar
          query={list.query}
          onQueryChange={list.setQuery}
          placeholder="Rechercher par réf., date, statut…"
          pageSize={list.pageSize}
          onPageSizeChange={list.setPageSize}
          totalCount={list.totalCount}
        />

        {list.paginated.length === 0 ? (
          <div className="client-portal-empty client-portal-empty--action">
            <p>
              {reservations.length === 0
                ? "Aucune réservation enregistrée pour le moment."
                : "Aucun résultat pour cette recherche."}
            </p>
            <Link to="/reservation" className="client-home__action client-home__action--primary">
              Réserver une table
            </Link>
          </div>
        ) : (
          <>
            <div className="client-table-wrap client-table-wrap--reservations">
              <table className="client-table client-table--listing">
                <thead>
                  <tr>
                    <th>Réf.</th>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Personnes</th>
                    <th>Statut</th>
                    <th className="client-table__actions-head">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.paginated.map((r) => (
                    <tr key={r.id}>
                      <td data-label="Réf.">
                        <button
                          type="button"
                          className="client-table__ref-btn"
                          onClick={() => openModal(r, "view")}
                        >
                          #{r.id || "—"}
                        </button>
                      </td>
                      <td data-label="Date">
                        <button
                          type="button"
                          className="client-table__link-btn"
                          onClick={() => openModal(r, "view")}
                        >
                          {formatShortDate(r.date)}
                        </button>
                      </td>
                      <td data-label="Heure">{formatHeureLabel(r.heure)}</td>
                      <td data-label="Personnes">
                        {r.nbPersonnes} pers.
                      </td>
                      <td data-label="Statut">
                        <ClientStatusBadge statut={r.statut} />
                      </td>
                      <td data-label="Actions" className="client-table__actions">
                        <ReservationRowActions
                          reservation={r}
                          onDetail={(item) => openModal(item, "view")}
                          onModify={(item) => openModal(item, "edit")}
                          onCancel={(item) => openModal(item, "cancel")}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="client-mobile-cards client-mobile-cards--reservations">
              {list.paginated.map((r) => (
                <li key={r.id}>
                  <article className="client-mobile-card client-mobile-card--reservation">
                    <div className="client-mobile-card__head">
                      <div>
                        <span className="client-mobile-card__ref">Réf. #{r.id || "—"}</span>
                        <strong>
                          {formatReservationDate(r.date)} · {formatHeureLabel(r.heure)}
                        </strong>
                      </div>
                      <ClientStatusBadge statut={r.statut} />
                    </div>
                    <p>{r.nbPersonnes} convive{r.nbPersonnes > 1 ? "s" : ""}</p>
                    <ReservationRowActions
                      reservation={r}
                      onDetail={(item) => openModal(item, "view")}
                      onModify={(item) => openModal(item, "edit")}
                      onCancel={(item) => openModal(item, "cancel")}
                    />
                  </article>
                </li>
              ))}
            </ul>

            <ClientListPagination
              page={list.page}
              totalPages={list.totalPages}
              rangeStart={list.rangeStart}
              rangeEnd={list.rangeEnd}
              totalCount={list.totalCount}
              onPageChange={list.setPage}
            />
          </>
        )}
      </section>

      {activeModal?.mode === "view" ? (
        <ClientReservationDetailModal
          key={`view-${activeModal.reservation.id}`}
          open
          reservation={activeModal.reservation}
          profile={profile}
          onClose={closeModal}
        />
      ) : null}

      {activeModal?.mode === "edit" ? (
        <ClientReservationModifyModal
          key={`edit-${activeModal.reservation.id}`}
          open
          reservation={activeModal.reservation}
          profile={profile}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
        />
      ) : null}

      {activeModal?.mode === "cancel" ? (
        <ClientReservationCancelModal
          key={`cancel-${activeModal.reservation.id}`}
          open
          reservation={activeModal.reservation}
          profile={profile}
          onClose={closeModal}
          onSuccess={handleModalSuccess}
        />
      ) : null}
    </ClientPageShell>
  );
}
