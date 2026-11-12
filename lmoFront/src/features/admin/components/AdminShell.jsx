import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../../common/auth/AuthContext";
import notificationsApi from "../api/notificationsApi";
import staffOpsApi from "../api/staffOpsApi";
import { COMPACT_NAV_KEY, getAvatar, getBoolPref } from "../adminPrefs";
import AdminConfirmModal from "./AdminConfirmModal";
import AdminNotificationPanel from "./AdminNotificationPanel";
import { ADMIN_NAV_ITEMS, AGENT_NAV_SECTIONS } from "../agentNavConfig";

const ICONS = {
  accueil: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ),
  horaires: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
      />
    </svg>
  ),
  restaurant: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
      />
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
    </svg>
  ),
  reservations: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"
      />
    </svg>
  ),
  commandes: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"
      />
    </svg>
  ),
  messages: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"
      />
    </svg>
  ),
  carte: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M3 5v14h18V5H3zm16 12H5V7h14v10zM7 9h6v2H7V9zm0 4h10v2H7v-2z" />
    </svg>
  ),
  galerie: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
      />
    </svg>
  ),
  agents: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
      />
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
      />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
      />
    </svg>
  ),
  compte: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  ),
  profil: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  ),
  clients: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.99 2.99 0 0 0 17.07 7h-2.14c-1.2 0-2.26.72-2.72 1.83L9.5 16H12v6h8zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9L6.74 8.34A2.99 2.99 0 0 0 4.07 7H2.93c-1.2 0-2.26.72-2.72 1.83L0 16h2.5v6h5z"
      />
    </svg>
  ),
  infos: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
      />
    </svg>
  ),
  site: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
      />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
      />
    </svg>
  ),
};

function NavItems({ items, active, unreadNotifications = 0, unreadMessages = 0 }) {
  return items.map((item) =>
    item.ready ? (
      <Link
        key={item.id}
        to={item.to}
        className={`admin-shell__nav-item${active === item.id ? " is-active" : ""}${
          item.dim ? " admin-shell__nav-item--dim" : ""
        }`}
      >
        <span className="admin-shell__nav-icon">{ICONS[item.id]}</span>
        <span className="admin-shell__nav-label">{item.label}</span>
        {item.id === "notifications" && unreadNotifications > 0 ? (
          <span className="admin-shell__nav-badge">{unreadNotifications}</span>
        ) : null}
        {item.id === "messages" && unreadMessages > 0 ? (
          <span className="admin-shell__nav-badge">{unreadMessages}</span>
        ) : null}
      </Link>
    ) : (
      <span
        key={item.id}
        className="admin-shell__nav-item admin-shell__nav-item--soon"
        title="Bientôt disponible"
      >
        <span className="admin-shell__nav-icon">{ICONS[item.id]}</span>
        <span className="admin-shell__nav-label">{item.label}</span>
        <em>bientôt</em>
      </span>
    )
  );
}

function AgentNavSections({ sections, active, unreadNotifications, unreadMessages }) {
  return sections.map((section) => (
    <div key={section.id} className="admin-shell__nav-group">
      <p className="admin-shell__nav-group-title">{section.title}</p>
      <NavItems items={section.items} active={active} unreadNotifications={unreadNotifications} unreadMessages={unreadMessages} />
    </div>
  ));
}

function AdminShell({
  active = "dashboard",
  title = "Tableau de bord",
  hideTopTitle = true,
  children,
}) {
  const { user, role, token, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === "ADMIN";
  const isAgent = role === "AGENT";
  const [avatarUrl, setAvatarUrl] = useState(() => getAvatar(user?.id));
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);

  const spaceLabel = isAdmin ? "Espace Admin" : "Espace Agent";
  const navAriaLabel = isAdmin ? "Navigation administrateur" : "Navigation agent";

  const refreshUnread = useCallback(async () => {
    if (!token) return;
    try {
      const data = await notificationsApi.unreadCount(token);
      setUnreadNotifications(Number(data?.count) || 0);
    } catch {
      /* silencieux */
    }
  }, [token]);

  useEffect(() => {
    refreshUnread();
    const onRefresh = () => refreshUnread();
    window.addEventListener("lmo-notifications-updated", onRefresh);
    const interval = window.setInterval(refreshUnread, 60000);
    return () => {
      window.removeEventListener("lmo-notifications-updated", onRefresh);
      window.clearInterval(interval);
    };
  }, [refreshUnread]);

  const refreshUnreadMessages = useCallback(async () => {
    if (!token) return;
    try {
      const data = await staffOpsApi.listMessages(token, "NOUVELLE");
      setUnreadMessages(Array.isArray(data) ? data.length : 0);
    } catch {
      /* silencieux */
    }
  }, [token]);

  useEffect(() => {
    refreshUnreadMessages();
    const onRefresh = () => refreshUnreadMessages();
    window.addEventListener("lmo-messages-updated", onRefresh);
    const interval = window.setInterval(refreshUnreadMessages, 60000);
    return () => {
      window.removeEventListener("lmo-messages-updated", onRefresh);
      window.clearInterval(interval);
    };
  }, [refreshUnreadMessages]);

  useEffect(() => {
    const sync = () => setAvatarUrl(getAvatar(user?.id));
    sync();
    window.addEventListener("lmo-avatar-updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("lmo-avatar-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [user?.id]);

  useEffect(() => {
    const compact = getBoolPref(COMPACT_NAV_KEY, false);
    document.documentElement.classList.toggle("admin-compact-nav", compact);
  }, []);

  function requestLogout() {
    setLogoutOpen(true);
  }

  function confirmLogout() {
    setLogoutOpen(false);
    logout();
    navigate("/connexion", { replace: true });
  }

  const rawName = user?.nom?.trim() || "";
  const emailLocal = user?.email ? user.email.split("@")[0] : "";
  const genericNames = new Set(["administrateur", "admin", "agent"]);
  const displayName =
    rawName && !genericNames.has(rawName.toLowerCase())
      ? rawName
      : emailLocal
        ? emailLocal.charAt(0).toUpperCase() + emailLocal.slice(1).replace(/[._-]/g, " ")
        : isAgent
          ? "Agent"
          : "Administrateur";
  const firstName = displayName.split(" ")[0];
  const initial = (firstName || "A").charAt(0).toUpperCase();
  const userSubtitle = isAgent ? "Compte agent" : user?.email || "Administrateur";

  return (
    <div className={`admin-shell${isAgent ? " admin-shell--agent" : ""}${isAdmin ? " admin-shell--admin" : ""}`}>
      <aside className="admin-shell__rail" aria-label={navAriaLabel}>
        <Link to="/admin/dashboard" className="admin-shell__brand">
          <img
            src="/images/logo-round.png"
            alt=""
            className="admin-shell__logo"
            width={52}
            height={52}
          />
          <div className="admin-shell__brand-copy">
            <span className="admin-shell__brand-name">La Maison Orientale</span>
            <span className="admin-shell__brand-tagline">{spaceLabel}</span>
          </div>
        </Link>

        <nav className="admin-shell__nav">
          {isAdmin ? (
            <NavItems
              items={ADMIN_NAV_ITEMS}
              active={active}
              unreadNotifications={unreadNotifications}
              unreadMessages={unreadMessages}
            />
          ) : (
            <AgentNavSections
              sections={AGENT_NAV_SECTIONS}
              active={active}
              unreadNotifications={unreadNotifications}
              unreadMessages={unreadMessages}
            />
          )}
        </nav>

        <div className="admin-shell__extras">
          <p className="admin-shell__extras-title">Utile</p>
          <ul>
            <li>
              <Link to="/" target="_blank" rel="noreferrer">
                {ICONS.site}
                <span>Voir le site client</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="admin-shell__nav-foot">
          <button type="button" className="admin-shell__logout-btn" onClick={requestLogout}>
            <span className="admin-shell__nav-icon">{ICONS.logout}</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="admin-shell__main">
        <header className="admin-shell__topbar">
          <div className="admin-shell__top-copy">
            {hideTopTitle ? null : (
              <>
                <h1 className="admin-shell__page-title">{title}</h1>
              </>
            )}
          </div>
          <div className="admin-shell__top-toolbar">
            <div className="admin-shell__notif-wrap">
              <button
                type="button"
                className={`admin-shell__notif-btn${active === "notifications" ? " is-active" : ""}${notifPanelOpen ? " is-open" : ""}`}
                title="Notifications"
                aria-label={
                  unreadNotifications > 0
                    ? `${unreadNotifications} notification(s) non lue(s)`
                    : "Notifications"
                }
                aria-expanded={notifPanelOpen}
                aria-haspopup="dialog"
                onClick={() => setNotifPanelOpen((open) => !open)}
              >
                {ICONS.bell}
                {unreadNotifications > 0 ? (
                  <span className="admin-shell__notif-badge">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                ) : null}
              </button>
              <AdminNotificationPanel
                token={token}
                open={notifPanelOpen}
                onClose={() => setNotifPanelOpen(false)}
                unreadCount={unreadNotifications}
                onUpdated={refreshUnread}
              />
            </div>
            <span className="admin-shell__top-divider" aria-hidden="true" />
            <Link
              to="/admin/compte"
              className="admin-shell__top-user"
              title={user?.email || undefined}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="admin-shell__avatar admin-shell__avatar--photo"
                />
              ) : (
                <span className="admin-shell__avatar" aria-hidden="true">
                  {initial}
                </span>
              )}
              <span className="admin-shell__top-user-meta">
                <strong>{displayName}</strong>
                {userSubtitle ? <small>{userSubtitle}</small> : null}
              </span>
            </Link>
          </div>
        </header>
        <div className="admin-shell__content">{children}</div>
      </div>

      <AdminConfirmModal
        open={logoutOpen}
        title="Déconnexion"
        message={
          isAgent
            ? "Voulez-vous quitter l'espace agent ?"
            : "Voulez-vous quitter l'espace d'administration ?"
        }
        confirmLabel="Se déconnecter"
        cancelLabel="Rester connecté"
        danger
        onConfirm={confirmLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
}

export default AdminShell;
