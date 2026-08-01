import { useEffect, useState } from "react";
import { useAuth } from "../../../common/auth/AuthContext";
import adminApi from "../api/adminApi";
import AdminShell from "../components/AdminShell";

const STATUT_LABEL = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  REFUSEE: "Refusée",
  ANNULEE: "Annulée",
  NOUVELLE: "Nouvelle",
  TRAITEE: "Traitée",
};

function greetingForHour(hour) {
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

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

function AdminDashboardPage() {
  const { user, token, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const payload = await adminApi.getDashboard(token);
        if (!cancelled) setData(payload);
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401 || err.status === 403) {
          logout();
          return;
        }
        setError(err.message || "Impossible de charger le tableau de bord.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const firstName = (user?.nom || "équipe").split(" ")[0];
  const hour = new Date().getHours();
  const kpis = data?.kpis;

  return (
    <AdminShell active="dashboard">
      <main className="admin-dash">
        <header className="admin-dash__hero">
          <div className="admin-dash__hero-copy">
            <p className="admin-dash__eyebrow">Pass de service</p>
            <h1>
              {greetingForHour(hour)}, {firstName}
            </h1>
            <p className="admin-dash__lead">
              {data ? (
                <>
                  {formatDateFr(data.today)}
                  {data.closedToday
                    ? " · maison fermée (lundi)"
                    : " · service ouvert"}
                </>
              ) : (
                "Vue d’ensemble du restaurant"
              )}
            </p>
          </div>
          <div className="admin-dash__hero-pulse" aria-hidden="true">
            <span className="admin-dash__pulse-ring" />
            <span className="admin-dash__pulse-core">
              {data?.closedToday ? "Fermé" : "Ouvert"}
            </span>
          </div>
        </header>

        {loading && (
          <p className="admin-dash__status" role="status">
            Chargement du pupitre…
          </p>
        )}

        {error && (
          <p className="admin-dash__status admin-dash__status--error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && data && (
          <>
            <section className="admin-dash__kpis" aria-label="Indicateurs du jour">
              <article className="admin-dash__kpi">
                <p className="admin-dash__kpi-label">Réservations aujourd’hui</p>
                <p className="admin-dash__kpi-value">{kpis.reservationsToday}</p>
                <p className="admin-dash__kpi-hint">créneaux actifs</p>
              </article>
              <article className="admin-dash__kpi">
                <p className="admin-dash__kpi-label">Couverts prévus</p>
                <p className="admin-dash__kpi-value">{kpis.coversToday}</p>
                <p className="admin-dash__kpi-hint">personnes sur la journée</p>
              </article>
              <article className="admin-dash__kpi">
                <p className="admin-dash__kpi-label">7 prochains jours</p>
                <p className="admin-dash__kpi-value">{kpis.reservationsWeek}</p>
                <p className="admin-dash__kpi-hint">réservations à venir</p>
              </article>
              <article
                className={`admin-dash__kpi${
                  kpis.pendingReservations + kpis.newMessages > 0
                    ? " admin-dash__kpi--alert"
                    : ""
                }`}
              >
                <p className="admin-dash__kpi-label">À traiter</p>
                <p className="admin-dash__kpi-value">
                  {kpis.pendingReservations + kpis.newMessages}
                </p>
                <p className="admin-dash__kpi-hint">
                  {kpis.pendingReservations} attente · {kpis.newMessages} message
                  {kpis.newMessages > 1 ? "s" : ""}
                </p>
              </article>
            </section>

            <div className="admin-dash__boards">
              <section className="admin-dash__panel" aria-labelledby="today-heading">
                <header className="admin-dash__panel-head">
                  <div>
                    <h2 id="today-heading">Service du jour</h2>
                    <p>Timeline des tables confirmées ou en attente</p>
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
                    Pas encore de réservation pour aujourd’hui. La salle est libre.
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

              <section className="admin-dash__panel" aria-labelledby="msg-heading">
                <header className="admin-dash__panel-head">
                  <div>
                    <h2 id="msg-heading">Messages récents</h2>
                    <p>Derniers contacts via le site</p>
                  </div>
                  <span className="admin-dash__count">{kpis.newMessages}</span>
                </header>

                {data.recentMessages.length === 0 ? (
                  <p className="admin-dash__empty">
                    Boîte calme pour le moment. Aucun message récent.
                  </p>
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

            <section className="admin-dash__panel admin-dash__panel--wide" aria-labelledby="up-heading">
              <header className="admin-dash__panel-head">
                <div>
                  <h2 id="up-heading">À venir cette semaine</h2>
                  <p>Aperçu hors aujourd’hui, pour anticiper le service</p>
                </div>
              </header>

              {data.upcomingReservations.length === 0 ? (
                <p className="admin-dash__empty">
                  Aucune réservation planifiée sur les jours suivants.
                </p>
              ) : (
                <div className="admin-dash__week">
                  {data.upcomingReservations.map((row) => (
                    <article key={row.id} className="admin-dash__week-item">
                      <p className="admin-dash__week-date">
                        {formatDateFr(row.date)}
                      </p>
                      <p className="admin-dash__week-main">
                        <strong>{formatTime(row.heure)}</strong>
                        <span>{row.nomClient}</span>
                      </p>
                      <p className="admin-dash__week-meta">
                        {row.nbPersonnes} p. ·{" "}
                        {STATUT_LABEL[row.statut] || row.statut}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="admin-dash__roadmap" aria-label="Prochaines étapes">
              <h2>Suite du pupitre</h2>
              <p className="admin-dash__roadmap-lead">
                Les modules suivants arriveront un par un, dans le même esprit.
              </p>
              <ul>
                <li>
                  <strong>Réservations</strong>
                  <span>Approuver, annuler, écrire au client</span>
                </li>
                <li>
                  <strong>Disponibilités</strong>
                  <span>Fermer un créneau ou ajuster la capacité</span>
                </li>
                <li>
                  <strong>Carte & prix</strong>
                  <span>Mettre à jour les plats affichés</span>
                </li>
              </ul>
            </section>
          </>
        )}
      </main>
    </AdminShell>
  );
}

export default AdminDashboardPage;
