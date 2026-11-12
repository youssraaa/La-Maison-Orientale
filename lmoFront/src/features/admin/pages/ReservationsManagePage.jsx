import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../common/auth/AuthContext";
import staffOpsApi from "../api/staffOpsApi";
import AdminPageShell from "../components/AdminPageShell";
import AdminShell from "../components/AdminShell";

const LABELS = {
  CONFIRMEE: "Confirmée",
  REFUSEE: "Refusée",
  ANNULEE: "Annulée",
  ARRIVEE: "Présenté",
  NO_SHOW: "Absent",
};

function todayIso() {
  return new Date().toLocaleDateString("sv-SE");
}

function formatDate(date, options = {}) {
  if (!date) return "—";
  return new Date(`${date}T12:00:00`).toLocaleDateString("fr-BE", {
    weekday: options.weekday,
    day: "numeric",
    month: options.month || "long",
    year: options.year,
  });
}

function formatTime(time) {
  return String(time || "").slice(0, 5).replace(":", "h") || "—";
}

function reservationTimestamp(reservation) {
  return new Date(`${reservation.date}T${String(reservation.heure || "00:00").slice(0, 5)}:00`).getTime();
}

function isPast(reservation) {
  return reservationTimestamp(reservation) < Date.now();
}

function isCountedReservation(reservation) {
  return !["ANNULEE", "REFUSEE"].includes(reservation.statut);
}

function CalendarIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" /></svg>;
}

function StatusBadge({ status }) {
  return <span className={`ops-badge ops-badge--${String(status || "").toLowerCase()}`}><span className="ops-badge__dot" />{LABELS[status] || status || "—"}</span>;
}

function DateRail({ value, onChange }) {
  const selected = new Date(`${value}T12:00:00`);
  const dates = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setTime(selected.getTime());
    date.setDate(date.getDate() + index - 5);
    return date.toLocaleDateString("sv-SE");
  });

  const shift = (amount) => {
    const next = new Date(`${value}T12:00:00`);
    next.setDate(next.getDate() + amount);
    onChange(next.toLocaleDateString("sv-SE"));
  };

  return <div className="reservation-date-rail" aria-label="Choisir un jour"><button type="button" className="reservation-date-rail__nav" onClick={() => shift(-1)} aria-label="Jour précédent">‹</button><div className="reservation-date-rail__days"><div className="reservation-date-rail__line" />{dates.map((date) => { const isSelected = date === value; const current = date === todayIso(); return <button type="button" key={date} className={`reservation-date-rail__day${isSelected ? " is-selected" : ""}${current ? " is-today" : ""}`} onClick={() => onChange(date)}><span>{current ? "Aujourd'hui" : formatDate(date, { weekday: "short", month: "short" }).split(" ")[0]}</span><strong>{new Date(`${date}T12:00:00`).getDate()}</strong><small>{new Date(`${date}T12:00:00`).toLocaleDateString("fr-BE", { month: "short" }).replace(".", "")}</small></button>; })}</div><button type="button" className="reservation-date-rail__nav" onClick={() => shift(1)} aria-label="Jour suivant">›</button></div>;
}

function ReservationCard({ reservation, onDetails, onStatus, busyId }) {
  const past = isPast(reservation);
  const canTrack = past && !["ANNULEE", "REFUSEE", "ARRIVEE", "NO_SHOW"].includes(reservation.statut);
  const busy = busyId === reservation.id;

  return <article className={`reservation-service-card reservation-service-card--${String(reservation.statut || "").toLowerCase()}`}>
    <div className="reservation-service-card__time"><strong>{formatTime(reservation.heure)}</strong><span>{reservation.nbPersonnes} pers.</span></div>
    <div className="reservation-service-card__main"><div className="reservation-service-card__identity"><h3>{reservation.nomClient || "Client sans nom"}</h3><span>Réf. #{reservation.id}</span></div><div className="reservation-service-card__date">{formatDate(reservation.date, { weekday: "short" })}</div><StatusBadge status={reservation.statut} /><div className="reservation-service-card__contact">{reservation.telephoneClient || "Téléphone non renseigné"}{reservation.emailClient ? ` · ${reservation.emailClient}` : ""}</div></div>
    <div className="reservation-service-card__actions"><button type="button" className="reservation-service-card__details" onClick={() => onDetails(reservation)}>Voir le détail</button>{canTrack ? <><button type="button" className="reservation-service-card__arrived" disabled={busy} onClick={() => onStatus(reservation.id, "ARRIVEE")}>Présenté</button><button type="button" className="reservation-service-card__absent" disabled={busy} onClick={() => onStatus(reservation.id, "NO_SHOW")}>Absent</button></> : null}</div>
  </article>;
}

function ReservationDetailModal({ reservation, onClose, onStatus, busyId }) {
  if (!reservation) return null;
  const busy = busyId === reservation.id;
  const canTrack = isPast(reservation) && !["ANNULEE", "REFUSEE", "ARRIVEE", "NO_SHOW"].includes(reservation.statut);

  return <div className="reservation-detail-overlay" role="presentation" onClick={onClose}><div className="reservation-detail-modal" role="dialog" aria-modal="true" aria-labelledby="reservation-detail-title" onClick={(event) => event.stopPropagation()}><header><div><p>Réservation #{reservation.id}</p><h2 id="reservation-detail-title">{reservation.nomClient || "Client sans nom"}</h2><span>{formatDate(reservation.date, { weekday: "long" })} à {formatTime(reservation.heure)}</span></div><button type="button" onClick={onClose} aria-label="Fermer">×</button></header><div className="reservation-detail-modal__status"><StatusBadge status={reservation.statut} /><strong>{reservation.nbPersonnes} personne{Number(reservation.nbPersonnes) > 1 ? "s" : ""}</strong></div><dl><div><dt>Téléphone</dt><dd>{reservation.telephoneClient || "—"}</dd></div><div><dt>E-mail</dt><dd>{reservation.emailClient || "—"}</dd></div><div><dt>Créée le</dt><dd>{reservation.createdAt ? new Date(reservation.createdAt).toLocaleString("fr-BE") : "—"}</dd></div></dl>{canTrack ? <section className="reservation-detail-modal__tracking"><h3>Après le créneau</h3><p>Indiquez si le client s'est présenté.</p><div><button type="button" className="reservation-service-card__arrived" disabled={busy} onClick={() => onStatus(reservation.id, "ARRIVEE")}>Client présenté</button><button type="button" className="reservation-service-card__absent" disabled={busy} onClick={() => onStatus(reservation.id, "NO_SHOW")}>Client absent</button></div></section> : null}</div></div>;
}

export default function ReservationsManagePage() {
  const { token, logout } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [detail, setDetail] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await staffOpsApi.listReservations(token, showAll ? {} : { date: selectedDate });
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      if ([401, 403].includes(err.status)) { logout(); return; }
      setError(err.message || "Impossible de charger les réservations.");
    } finally { setLoading(false); }
  }, [token, logout, showAll, selectedDate]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const timer = window.setInterval(load, 30000); return () => window.clearInterval(timer); }, [load]);

  const visible = useMemo(() => reservations
    .filter((row) => statusFilter === "ALL" || row.statut === statusFilter)
    .filter((row) => !search.trim() || [row.id, row.nomClient, row.telephoneClient, row.emailClient].join(" ").toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => showAll ? reservationTimestamp(b) - reservationTimestamp(a) : reservationTimestamp(a) - reservationTimestamp(b)), [reservations, statusFilter, search, showAll]);
    const countedReservations = visible.filter(isCountedReservation);
    const upcoming = countedReservations.filter((row) => !isPast(row)).length;
    const upcomingCovers = countedReservations
      .filter((row) => !isPast(row))
      .reduce((total, row) => total + (Number(row.nbPersonnes) || 0), 0);
    const totalReservations = visible.length;
    const cancelledReservations = visible.filter((row) => row.statut === "ANNULEE").length;

  async function updateStatus(id, status) {
    setBusyId(id);
    setError("");
    try {
      const updated = await staffOpsApi.updateReservationStatut(token, id, status);
      setReservations((current) => current.map((row) => row.id === id ? updated : row));
      setDetail(updated);
    } catch (err) {
      if ([401, 403].includes(err.status)) { logout(); return; }
      setError(err.message || "La mise à jour n'a pas pu être enregistrée.");
    } finally { setBusyId(null); }
  }

  function changeDate(date) {
    setSelectedDate(date);
    setShowAll(false);
  }

  return <AdminShell active="reservations" title="Gestion des réservations" hideTopTitle><AdminPageShell pageClass="admin-page--agents admin-ops-shell" title="Gestion des réservations" lead="Réservations du restaurant" icon={CalendarIcon} action={<button type="button" className="reservation-agenda-button" onClick={() => setShowAll((current) => !current)}>{showAll ? "Aujourd'hui" : "Tout l'agenda"}</button>}>
    <section className="reservation-overview"><div><p className="reservation-overview__eyebrow">{showAll ? "Vue générale" : "Service du jour"}</p><h2>{showAll ? "Toutes les réservations" : formatDate(selectedDate, { weekday: "long" })}</h2><p>{showAll ? "Retrouvez l'historique complet des réservations." : "Les réservations prévues pour aujourd'hui."}</p></div><div className="reservation-overview__numbers"><div><strong>{upcoming}</strong><span>réservations à venir</span></div><div><strong>{upcomingCovers}</strong><span>couverts à venir</span></div><div><strong>{cancelledReservations}</strong><span>réservations annulées</span></div><div><strong>{totalReservations}</strong><span>réservations au total</span></div></div></section>
    {!showAll ? <DateRail value={selectedDate} onChange={changeDate} /> : null}
    <div className="reservation-list-toolbar"><div className="ops-search"><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un client ou une référence…" /></div><div className="reservation-status-filter">{[["ALL", "Toutes"], ["CONFIRMEE", "Confirmées"], ["ANNULEE", "Annulées"], ["ARRIVEE", "Présentés"], ["NO_SHOW", "Absents"]].map(([value, label]) => <button type="button" key={value} className={statusFilter === value ? "is-active" : ""} onClick={() => setStatusFilter(value)}>{label}</button>)}</div></div>
    {error ? <div className="ops-error" role="alert">{error}</div> : null}
    {loading ? <div className="ops-loading"><span className="ops-loading__spinner" />Chargement des réservations…</div> : visible.length === 0 ? <div className="reservation-empty"><CalendarIcon /><h3>Aucune réservation</h3><p>{showAll ? "L'historique est vide pour le moment." : "Aucune table n'est prévue pour cette date."}</p></div> : <section className="reservation-service-list" aria-label="Liste des réservations">{visible.map((reservation) => <ReservationCard key={reservation.id} reservation={reservation} onDetails={setDetail} onStatus={updateStatus} busyId={busyId} />)}</section>}
  </AdminPageShell><ReservationDetailModal reservation={detail} onClose={() => setDetail(null)} onStatus={updateStatus} busyId={busyId} /></AdminShell>;
}