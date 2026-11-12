import { Link, NavLink, Outlet, useOutletContext } from "react-router-dom";
import PublicNavbar from "../../../common/components/PublicNavbar";
import { useClientAuth } from "../../../common/auth/ClientAuthContext";
import useRestaurantInfo from "../../../common/hooks/useRestaurantInfo";
import {
  useClientAccountData,
  clientInitials,
  formatMemberSince,
  isUpcomingReservation,
} from "../hooks/useClientAccountData";
import {
  IconBag,
  IconBell,
  IconCalendar,
  IconDashboard,
  IconHelp,
  IconLogout,
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
    badgeKey: "reservations",
  },
  {
    to: "/mon-compte/commandes",
    label: "Mes commandes",
    icon: IconBag,
    badgeKey: "commandes",
  },
  {
    to: "/mon-compte/profil",
    label: "Mon profil",
    icon: IconUser,
    badgeKey: null,
  },
  {
    to: "/mon-compte/messages",
    label: "Mes messages",
    icon: IconBell,
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
  const { info } = useRestaurantInfo();
  const account = useClientAccountData(token);
  const displayNom =
    [account.profile?.prenom, account.profile?.nom].filter(Boolean).join(" ") ||
    account.profile?.nom ||
    user?.nom ||
    "";
  const upcomingCount = account.reservations.filter(isUpcomingReservation).length;

  const badges = {
    reservations: upcomingCount,
    commandes: account.commandes.length,
  };

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

            <button type="button" className="client-portal__logout" onClick={logout}>
              <IconLogout />
              <span>Déconnexion</span>
            </button>
          </aside>

          <div className="client-portal__content">
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

    </main>
  );
}
