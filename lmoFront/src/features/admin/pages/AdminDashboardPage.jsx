import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../common/auth/AuthContext";
import adminApi from "../api/adminApi";
import AdminShell from "../components/AdminShell";
import AdminPageShell from "../components/AdminPageShell";
import DashboardCharts from "../components/DashboardCharts";
import DashboardRecentMessages from "../components/DashboardRecentMessages";
import saveDashboardPdf from "../utils/buildDashboardPdf";
import { DASH_DAYS_KEY } from "../adminPrefs";

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

function formatEuro(value) {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function truncate(text, max = 140) {
  if (!text) return "";
  const clean = text.trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function formatMsgTime(isoInstant) {
  if (!isoInstant) return "";
  return new Date(isoInstant).toLocaleString("fr-BE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}


function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
      />
    </svg>
  );
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

function IconCart() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
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

function StatCard({ to, label, value, hint, icon, iconTone, delay }) {
  return (
    <article className={`admin-stat-card admin-stat-card--delay-${delay}`}>
      <div className="admin-stat-card__content">
        <p className="admin-stat-card__label">{label}</p>
        <p className="admin-stat-card__value">{value}</p>
        <p className="admin-stat-card__hint">{hint}</p>
        {to ? (
          <Link to={to} className="admin-stat-card__link">
            Voir tout →
          </Link>
        ) : null}
      </div>
      <span className={`admin-stat-card__icon admin-stat-card__icon--${iconTone}`}>
        {icon}
      </span>
    </article>
  );
}

function QuickIcon({ children }) {
  return <span className="admin-dash__ql-icon" aria-hidden="true">{children}</span>;
}

const QUICK_LINKS_AGENT = [
  {
    to: "/admin/reservations",
    label: "Réservations",
    sub: "Gérer les résas",
    icon: <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" /></svg>,
  },
  {
    to: "/admin/commandes",
    label: "Commandes",
    sub: "Suivi & livraison",
    icon: <svg viewBox="0 0 24 24"><path fill="currentColor" d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0020 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" /></svg>,
  },
  {
    to: "/admin/messages",
    label: "Messages",
    sub: "Demandes clients",
    icon: <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" /></svg>,
  },
  {
    to: "/admin/clients",
    label: "Clients",
    sub: "Fichier contacts",
    icon: <svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>,
  },
  {
    to: "/admin/compte",
    label: "Mon profil",
    sub: "Paramètres compte",
    icon: <svg viewBox="0 0 24 24"><path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.6 3.6 0 0112 15.6z" /></svg>,
  },
];

const QUICK_LINKS_ADMIN = [
  {
    to: "/admin/agents",
    label: "Gestion agents",
    sub: "Équipe & accès",
    icon: <svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>,
  },
  {
    to: "/admin/notifications",
    label: "Notifications",
    sub: "Alertes & infos",
    icon: <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" /></svg>,
  },
  {
    to: "/admin/compte",
    label: "Mon profil",
    sub: "Paramètres compte",
    icon: <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>,
  },
];

function QuickLinks({ role }) {
  const links = role === "ADMIN" ? QUICK_LINKS_ADMIN : QUICK_LINKS_AGENT;

  return (
    <div className="admin-dash__quick-links">
      <p className="admin-dash__ql-title">Accès directs</p>
      <ul className="admin-dash__ql-list">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="admin-dash__ql">
              <QuickIcon>{link.icon}</QuickIcon>
              <span className="admin-dash__ql-text">
                <span className="admin-dash__ql-label">{link.label}</span>
                <span className="admin-dash__ql-sub">{link.sub}</span>
              </span>
              <span className="admin-dash__ql-arrow">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdminDashboardPage() {
  const { token, logout, role } = useAuth();
  const isAdmin = role === "ADMIN";
  const reservationsLink = isAdmin ? null : "/admin/reservations";
  const messagesLink = isAdmin ? "/admin/notifications" : "/admin/messages";
  const commandesLink = "/admin/commandes";
  const [data, setData] = useState(null);
  const [days, setDays] = useState(() => {
    const raw = localStorage.getItem(DASH_DAYS_KEY);
    return raw === "30" ? 30 : 7;
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
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

  async function handleExportPdf() {
    if (!data) return;
    setPdfLoading(true);
    setError("");
    try {
      await saveDashboardPdf({
        data,
        daysLabel: `${data.days} jours`,
        chartRootId: "lmo-dashboard-charts",
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Export PDF impossible. Réessayez après actualisation.");
    } finally {
      setPdfLoading(false);
    }
  }

  const kpis = data?.kpis;

  const recentMessages = useMemo(() => (data?.recentMessages || []).slice(0, 5), [data]);

  return (
    <AdminShell active="dashboard" title="Tableau de bord" hideTopTitle>
      <AdminPageShell
          pageClass="admin-page--dashboard"
          title="Tableau de bord"
          lead={
            data
              ? `Vue d'ensemble · ${formatDateFr(data.today)}`
              : "Vue d'ensemble de l'activité du restaurant"
          }
          icon={IconDashboard}
          statusChip={
            data
              ? {
                  label: data.closedToday ? "Fermé" : "Ouvert",
                  tone: data.closedToday ? "alert" : "ok",
                }
              : undefined
          }
        >
          <div className="admin-page__toolbar">
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
            <button
              type="button"
              className="admin-dash__refresh admin-dash__export-pdf"
              onClick={handleExportPdf}
              disabled={pdfLoading || loading || !data}
            >
              {pdfLoading ? "PDF…" : "Exporter PDF"}
            </button>
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

        {!loading && !error && data && kpis && (
          <>
            <section className="admin-dash__stat-cards admin-dash__stat-cards--five" aria-label="Indicateurs">
              <StatCard
                to={reservationsLink}
                label="Réservations du jour"
                value={kpis.reservationsToday}
                hint="Confirmées aujourd'hui"
                icon={<IconCalendar />}
                iconTone="violet"
                delay={1}
              />
              <StatCard
                to={reservationsLink}
                label="Couverts prévus"
                value={kpis.coversToday}
                hint="Personnes attendues"
                icon={<IconUsers />}
                iconTone="orange"
                delay={2}
              />
              <StatCard
                to={commandesLink}
                label="Commandes"
                value={kpis.commandesPeriod}
                hint={`${kpis.commandesToday} auj. · ${formatEuro(kpis.revenuePeriod)}`}
                icon={<IconCart />}
                iconTone="teal"
                delay={3}
              />
              <StatCard
                to={messagesLink}
                label="Nouveaux messages"
                value={kpis.newMessages}
                hint="À traiter"
                icon={<IconMail />}
                iconTone="saffron"
                delay={4}
              />
              <StatCard
                to={reservationsLink}
                label="Réservations année"
                value={kpis.reservationsYear}
                hint={`${kpis.coversYear} couverts · ${kpis.pendingReservations} en attente`}
                icon={<IconCheck />}
                iconTone="indigo"
                delay={5}
              />
            </section>

            <div className="admin-dash__charts-row">
              <section className="admin-card admin-card--charts-full" id="lmo-dashboard-charts">
                <DashboardCharts charts={data.charts} days={data.days} />
              </section>

              <div className="admin-dash__right-col">
                <DashboardRecentMessages
                  messages={recentMessages}
                  messagesLink={messagesLink}
                  newCount={kpis.newMessages}
                />

                <QuickLinks role={role} />
              </div>
            </div>

            <section className="admin-card admin-card--service">
              <header className="admin-card__head admin-card__head--compact">
                <div>
                  <h2>Service du jour</h2>
                  <p>Réservations d&apos;aujourd&apos;hui</p>
                </div>
                <span className="admin-dash__count">{data.todayReservations.length}</span>
              </header>
              {data.closedToday ? (
                <p className="admin-dash__empty">Restaurant fermé aujourd&apos;hui.</p>
              ) : data.todayReservations.length === 0 ? (
                <p className="admin-dash__empty">Pas encore de réservation.</p>
              ) : (
                <ol className="admin-dash__timeline">
                  {data.todayReservations.map((row) => (
                    <li key={row.id} className="admin-dash__slot">
                      <time dateTime={`${row.date}T${row.heure}`}>{formatTime(row.heure)}</time>
                      <div className="admin-dash__slot-body">
                        <p className="admin-dash__slot-name">{row.nomClient}</p>
                        <p className="admin-dash__slot-meta">
                          {row.nbPersonnes} pers.
                          {row.telephoneClient ? ` · ${row.telephoneClient}` : ""}
                        </p>
                        {row.commentaire ? (
                          <p className="admin-dash__slot-note">{truncate(row.commentaire, 90)}</p>
                        ) : null}
                      </div>
                      <span className={`admin-dash__pill admin-dash__pill--${row.statut.toLowerCase()}`}>
                        {STATUT_LABEL[row.statut] || row.statut}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
              {reservationsLink ? (
                <footer className="admin-dash__aside-foot">
                  <Link to={reservationsLink} className="client-home__action client-home__action--ghost">
                    Voir toutes les réservations →
                  </Link>
                </footer>
              ) : null}
            </section>
          </>
        )}
        </AdminPageShell>
    </AdminShell>
  );
}

export default AdminDashboardPage;
