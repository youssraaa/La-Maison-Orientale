import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import PublicNavbar from "../../../common/components/PublicNavbar";
import { useClientAuth } from "../../../common/auth/ClientAuthContext";
import useRestaurantInfo from "../../../common/hooks/useRestaurantInfo";
import {
  useClientAccountData,
  clientInitials,
  formatMemberSince,
} from "../hooks/useClientAccountData";
import { fetchClientUnreadNotificationCount } from "../api/clientAccountApi";
import ClientConfirmModal from "./ClientConfirmModal";
import ClientNotificationPanel from "./ClientNotificationPanel";
import {
  IconBag,
  IconBell,
  IconCalendar,
  IconDashboard,
  IconHelp,
  IconLogout,
  IconMail,
  IconMap,
  IconMenu,
  IconUser,
} from "./ClientPortalIcons";

const NAV_ITEMS = [
  {
    to: "/mon-compte",
    end: true,
    label: "Vue d'ensemble",
    icon: IconDashboard,
    badgeKey: null,
  },
  {
    to: "/mon-compte/reservations",
    label: "Mes réservations",
    icon: IconCalendar,
    badgeKey: null,
  },
  {
    to: "/mon-compte/commandes",
    label: "Mes commandes",
    icon: IconBag,
    badgeKey: null,
  },
  {
    to: "/mon-compte/messages",
    label: "Contacter le restaurant",
    icon: IconMail,
    badgeKey: "messages",
  },
  {
    to: "/mon-compte/notifications",
    label: "Mes notifications",
    icon: IconBell,
    badgeKey: "notifications",
  },
  {
    to: "/mon-compte/profil",
    label: "Mon profil",
    icon: IconUser,
    badgeKey: null,
  },
];

const EXTRA_LINKS = [
  { to: "/carte", label: "Notre carte", icon: IconMenu },
  { to: "/contact", label: "Contact", icon: IconMap },
  { to: "/contact", label: "Aide", icon: IconHelp },
];

function initialsFromProfile(profile, user) {
  return clientInitials(profile?.prenom, profile?.nom || user?.nom);
}

export function useClientPortal() {
  return useOutletContext();
}

export default function ClientPortalLayout() {
  const { token, user, logout } = useClientAuth();
  const navigate = useNavigate();
  const { info } = useRestaurantInfo();
  const location = useLocation();
  const account = useClientAccountData(token);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const displayNom =
    [account.profile?.prenom, account.profile?.nom].filter(Boolean).join(" ") ||
    account.profile?.nom ||
    user?.nom ||
    "";

  const badges = {
    messages: (account.messages || []).filter(
      (m) => String(m.statut || "").toUpperCase() === "NOUVELLE"
    ).length,
    notifications: unreadNotifications,
  };

  const refreshUnread = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchClientUnreadNotificationCount(token);
      setUnreadNotifications(Number(data?.count) || 0);
    } catch {
      /* silencieux */
    }
  }, [token]);

  useEffect(() => {
    const fromList = (account.notifications || []).filter((n) => !n.lue).length;
    setUnreadNotifications(fromList);
  }, [account.notifications]);

  useEffect(() => {
    refreshUnread();
    const onRefresh = () => {
      refreshUnread();
      account.refresh?.();
    };
    window.addEventListener("lmo-notifications-updated", onRefresh);
    const interval = window.setInterval(refreshUnread, 60000);
    return () => {
      window.removeEventListener("lmo-notifications-updated", onRefresh);
      window.clearInterval(interval);
    };
  }, [refreshUnread, account.refresh]);

  const onNotificationsPage = location.pathname.startsWith("/mon-compte/notifications");

  function requestLogout() {
    setLogoutOpen(true);
  }

  function confirmLogout() {
    setLogoutOpen(false);
    logout();
    navigate("/connexion", { replace: true });
  }

  return (
    <main className="page client-portal-page">
      <PublicNavbar />

      <div className="client-portal-shell">
        <div className="client-portal-card">
          <aside className="client-portal__nav" aria-label="Mon compte">
            <div className="client-portal__nav-head">
              <div className="client-portal__profile">
                <div className="client-portal__avatar client-avatar" aria-hidden="true">
                  {initialsFromProfile(account.profile, user)}
                </div>
                <div>
                  <strong>{displayNom || "Mon compte"}</strong>
                  <span>{account.profile?.email || user?.email || ""}</span>
                  {account.profile?.createdAt ? (
                    <em>{formatMemberSince(account.profile.createdAt)}</em>
                  ) : null}
                </div>
              </div>
            </div>

            <nav className="client-portal__menu">
              <ul>
                {NAV_ITEMS.map(({ to, end, label, icon: Icon, badgeKey }) => {
                  const badge = badgeKey ? badges[badgeKey] : 0;
                  return (
                    <li key={to}>
                      <NavLink
                        to={to}
                        end={end}
                        className={({ isActive }) => (isActive ? "is-active" : undefined)}
                      >
                        <span className="client-portal__nav-icon" aria-hidden="true">
                          <Icon />
                        </span>
                        <span className="client-portal__nav-label">{label}</span>
                        {badge > 0 ? (
                          <span className="client-portal__nav-badge">{badge}</span>
                        ) : null}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="client-portal__extras">
              <p className="client-portal__extras-title">Utile</p>
              <ul>
                {EXTRA_LINKS.map(({ to, label, icon: Icon }) => (
                  <li key={`${to}-${label}`}>
                    <Link to={to}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="client-portal__nav-foot">
              <button type="button" className="client-portal__logout" onClick={requestLogout}>
                <IconLogout />
                <span>Déconnexion</span>
              </button>
            </div>
          </aside>

          <div className="client-portal__content">
            {!account.loading && !account.error ? (
              <header className="client-portal__topbar">
                <p className="client-portal__topbar-title">Mon espace client</p>
                <div className="client-portal__notif-wrap">
                  <button
                    type="button"
                    className={`client-portal__notif-btn${onNotificationsPage ? " is-active" : ""}${notifPanelOpen ? " is-open" : ""}`}
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
                    <IconBell aria-hidden="true" />
                    {unreadNotifications > 0 ? (
                      <span className="client-portal__notif-badge">
                        {unreadNotifications > 99 ? "99+" : unreadNotifications}
                      </span>
                    ) : null}
                  </button>
                  <ClientNotificationPanel
                    token={token}
                    open={notifPanelOpen}
                    onClose={() => setNotifPanelOpen(false)}
                    unreadCount={unreadNotifications}
                    onUpdated={() => {
                      account.refresh?.();
                      refreshUnread();
                    }}
                  />
                </div>
              </header>
            ) : null}

            {account.loading ? (
              <div className="client-portal__loading">
                <span className="client-portal__loading-dot" aria-hidden="true" />
                <p>Chargement…</p>
              </div>
            ) : account.error ? (
              <p className="client-portal__error" role="alert">
                {account.error}
              </p>
            ) : (
              <Outlet context={{ ...account, user, logout, info }} />
            )}
          </div>
        </div>
      </div>

      <ClientConfirmModal
        open={logoutOpen}
        title="Déconnexion"
        message="Voulez-vous vraiment quitter votre espace client ?"
        confirmLabel="Se déconnecter"
        cancelLabel="Rester connecté"
        danger
        onConfirm={confirmLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </main>
  );
}
