import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../common/auth/AuthContext";
import adminApi from "../api/adminApi";
import AdminShell from "../components/AdminShell";
import DashboardCharts from "../components/DashboardCharts";

const STATUT_LABEL = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  REFUSEE: "Refusée",
  ANNULEE: "Annulée",
  NOUVELLE: "Nouvelle",
  TRAITEE: "Traitée",
};

function formatDateFr(isoDate) {
  if (!isoDate) return "";
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString("fr-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTime(isoTime) {
  if (!isoTime) return "";
  return isoTime.slice(0, 5);
}

function formatRelative(isoInstant) {
  if (!isoInstant) return "";
  const then = new Date(isoInstant).getTime();
  const diffMin = Math.round((Date.now() - then) / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const hours = Math.round(diffMin / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  return `il y a ${days} j`;
}

function truncate(text, max = 90) {
  if (!text) return "";
  const clean = text.trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"
      />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
      />
    </svg>
  );
}

function IconMail() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"
      />
    </svg>
  );
}

function AdminDashboardPage() {
  const { token, logout } = useAuth();
  const [data, setData] = useState(null);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      setError("");
      try {
        const payload = await adminApi.getDashboard(token, days);
        setData(payload);
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          logout();
          return;
        }
        setError(err.message || "Impossible de charger le tableau de bord.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token, days, logout]
  );

  useEffect(() => {
    load();
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await load({ silent: true });
    } finally {
      setRefreshing(false);
    }
  }

  const kpis = data?.kpis;
  const statusTotal = useMemo(
    () =>
      (data?.charts?.reservationsByStatus || []).reduce(
        (sum, row) => sum + (row.value || 0),
        0
      ),
    [data]
  );
  const statusBars = useMemo(() => {
    const rows = data?.charts?.reservationsByStatus || [];
    const total = statusTotal || 1;
    return rows.map((row) => ({
      ...row,
      pct: Math.round(((row.value || 0) * 100) / total),
    }));
  }, [data, statusTotal]);

  const recentRows = useMemo(() => {
    if (!data) return [];
    return [...data.todayReservations, ...data.upcomingReservations].slice(0, 5);
  }, [data]);

  return (
    <AdminShell active="dashboard" title="Tableau de bord">
      <main className="admin-dash">
        <div className="admin-dash__intro">
          <div>
            <p className="admin-dash__intro-eyebrow">Vue d’ensemble</p>
            <h2 className="admin-dash__intro-title">
              {data
                ? formatDateFr(data.today)
                : "Activité du restaurant"}
            </h2>
          </div>
          <div className="admin-dash__toolbar">
            <div className="admin-dash__period" role="group" aria-label="Période des stats">
              <button
                type="button"
                className={days === 7 ? "is-active" : ""}
                onClick={() => setDays(7)}
              >
                7 jours
              </button>
              <button
                type="button"
                className={days === 30 ? "is-active" : ""}
                onClick={() => setDays(30)}
              >
                30 jours
              </button>
            </div>
            <button
              type="button"
              className="admin-dash__refresh"
              onClick={handleRefresh}
              disabled={refreshing || loading}
            >
              {refreshing ? "Actualisation…" : "Rafraîchir"}
            </button>
            {data && (
              <span
                className={`admin-dash__badge-open${
                  data.closedToday ? " is-closed" : ""
                }`}
              >
                <span className="admin-dash__badge-dot" aria-hidden="true" />
                {data.closedToday ? "Fermé" : "Ouvert"}
              </span>
            )}
          </div>
        </div>

        {loading && (
          <div className="admin-dash__skeleton" aria-busy="true" aria-label="Chargement">
            <div className="admin-dash__skeleton-row" />
            <div className="admin-dash__skeleton-row" />
            <div className="admin-dash__skeleton-block" />
          </div>
        )}

        {error && (
          <p className="admin-dash__status admin-dash__status--error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && data && (
          <>
            <section className="admin-dash__stat-cards" aria-label="Indicateurs">
              <article className="admin-stat-card admin-stat-card--delay-1">
                <div>
                  <p className="admin-stat-card__label">Réservations du jour</p>
                  <p className="admin-stat-card__value">{kpis.reservationsToday}</p>
                  <p className="admin-stat-card__hint">Créneaux actifs</p>
                </div>
                <span className="admin-stat-card__icon admin-stat-card__icon--violet">
                  <IconCalendar />
                </span>
              </article>
              <article className="admin-stat-card admin-stat-card--delay-2">
                <div>
                  <p className="admin-stat-card__label">Couverts prévus</p>
                  <p className="admin-stat-card__value">{kpis.coversToday}</p>
                  <p className="admin-stat-card__hint">Sur la journée</p>
                </div>
                <span className="admin-stat-card__icon admin-stat-card__icon--orange">
                  <IconUsers />
                </span>
              </article>
              <article className="admin-stat-card admin-stat-card--delay-3">
                <div>
                  <p className="admin-stat-card__label">Messages nouveaux</p>
                  <p className="admin-stat-card__value">{kpis.newMessages}</p>
                  <p className="admin-stat-card__hint">À lire</p>
                </div>
                <span className="admin-stat-card__icon admin-stat-card__icon--teal">
                  <IconMail />
                </span>
              </article>
              <article className="admin-stat-card admin-stat-card--delay-4">
                <div>
                  <p className="admin-stat-card__label">Taux confirmées</p>
                  <p className="admin-stat-card__value">{kpis.confirmationRate}%</p>
                  <p className="admin-stat-card__hint">Sur {data.days} jours</p>
                </div>
                <span className="admin-stat-card__icon admin-stat-card__icon--indigo">
                  <IconCheck />
                </span>
              </article>
            </section>

            <section className="admin-dash__color-cards" aria-label="Synthèse période">
              <article className="admin-color-card admin-color-card--violet">
                <div>
                  <p>Réservations</p>
                  <strong>{kpis.reservationsPeriod}</strong>
                  <span>sur {data.days} jours</span>
                </div>
                <span className="admin-color-card__bubble">
                  <IconCalendar />
                </span>
              </article>
              <article className="admin-color-card admin-color-card--mint">
                <div>
                  <p>Couverts</p>
                  <strong>{kpis.coversPeriod}</strong>
                  <span>personnes prévues</span>
                </div>
                <span className="admin-color-card__bubble">
                  <IconUsers />
                </span>
              </article>
              <article className="admin-color-card admin-color-card--orange">
                <div>
                  <p>Messages</p>
                  <strong>{kpis.messagesPeriod}</strong>
                  <span>reçus sur la période</span>
                </div>
                <span className="admin-color-card__bubble">
                  <IconMail />
                </span>
              </article>
              <article className="admin-color-card admin-color-card--magenta">
                <div>
                  <p>À traiter</p>
                  <strong>
                    {kpis.pendingReservations + kpis.newMessages}
                  </strong>
                  <span>
                    {kpis.pendingReservations} attente · {kpis.newMessages} msg
                  </span>
                </div>
                <span className="admin-color-card__bubble">
                  <IconCheck />
                </span>
              </article>
            </section>

            <div className="admin-dash__split">
              <section className="admin-card">
                <header className="admin-card__head">
                  <div>
                    <h2>Réservations par période</h2>
                    <p>Courbe des réservations et couverts</p>
                  </div>
                </header>
                <DashboardCharts charts={data.charts} days={data.days} compact />
              </section>

              <section className="admin-card">
                <header className="admin-card__head">
                  <div>
                    <h2>Statistiques des réservations</h2>
                    <p>Répartition sur {data.days} jours</p>
                  </div>
                </header>
                <ul className="admin-progress">
                  {statusBars.map((row) => (
                    <li key={row.statut}>
                      <div className="admin-progress__meta">
                        <span>{row.label}</span>
                        <strong>
                          {row.value} / {statusTotal}
                        </strong>
                      </div>
                      <div className="admin-progress__track">
                        <span
                          className={`admin-progress__fill admin-progress__fill--${row.statut.toLowerCase()}`}
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                <header className="admin-card__head admin-card__head--sub">
                  <div>
                    <h2>Dernières réservations</h2>
                  </div>
                </header>
                {recentRows.length === 0 ? (
                  <p className="admin-dash__empty">Aucune réservation récente.</p>
                ) : (
                  <ul className="admin-resa-list">
                    {recentRows.map((row) => (
                      <li key={row.id}>
                        <div>
                          <p className="admin-resa-list__title">
                            {row.nbPersonnes} pers. · {row.nomClient}
                          </p>
                          <p className="admin-resa-list__meta">
                            {formatDateFr(row.date)} · {formatTime(row.heure)}
                          </p>
                        </div>
                        <span
                          className={`admin-dash__pill admin-dash__pill--${row.statut.toLowerCase()}`}
                        >
                          {STATUT_LABEL[row.statut] || row.statut}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="admin-dash__boards">
              <section className="admin-card">
                <header className="admin-card__head">
                  <div>
                    <h2>Service du jour</h2>
                    <p>Timeline des tables</p>
                  </div>
                  <span className="admin-dash__count">
                    {data.todayReservations.length}
                  </span>
                </header>
                {data.closedToday ? (
                  <p className="admin-dash__empty">
                    Lundi de repos. Aucune réservation attendue.
                  </p>
                ) : data.todayReservations.length === 0 ? (
                  <p className="admin-dash__empty">
                    Pas encore de réservation pour aujourd’hui.
                  </p>
                ) : (
                  <ol className="admin-dash__timeline">
                    {data.todayReservations.map((row) => (
                      <li key={row.id} className="admin-dash__slot">
                        <time dateTime={`${row.date}T${row.heure}`}>
                          {formatTime(row.heure)}
                        </time>
                        <div className="admin-dash__slot-body">
                          <p className="admin-dash__slot-name">{row.nomClient}</p>
                          <p className="admin-dash__slot-meta">
                            {row.nbPersonnes}{" "}
                            {row.nbPersonnes > 1 ? "personnes" : "personne"}
                            {row.telephoneClient
                              ? ` · ${row.telephoneClient}`
                              : ""}
                          </p>
                          {row.commentaire ? (
                            <p className="admin-dash__slot-note">
                              {truncate(row.commentaire, 110)}
                            </p>
                          ) : null}
                        </div>
                        <span
                          className={`admin-dash__pill admin-dash__pill--${row.statut.toLowerCase()}`}
                        >
                          {STATUT_LABEL[row.statut] || row.statut}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="admin-card">
                <header className="admin-card__head">
                  <div>
                    <h2>Messages récents</h2>
                    <p>Contacts via le site</p>
                  </div>
                  <span className="admin-dash__count">{kpis.newMessages}</span>
                </header>
                {data.recentMessages.length === 0 ? (
                  <p className="admin-dash__empty">Aucun message récent.</p>
                ) : (
                  <ul className="admin-dash__inbox">
                    {data.recentMessages.map((msg) => (
                      <li key={msg.id} className="admin-dash__msg">
                        <div className="admin-dash__msg-top">
                          <strong>{msg.nom}</strong>
                          <span
                            className={`admin-dash__pill admin-dash__pill--${msg.statut.toLowerCase()}`}
                          >
                            {STATUT_LABEL[msg.statut] || msg.statut}
                          </span>
                        </div>
                        <p className="admin-dash__msg-subject">
                          {msg.sujet || "Sans sujet"}
                        </p>
                        <p className="admin-dash__msg-preview">
                          {truncate(msg.message, 120)}
                        </p>
                        <p className="admin-dash__msg-when">
                          {formatRelative(msg.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </AdminShell>
  );
}

export default AdminDashboardPage;
