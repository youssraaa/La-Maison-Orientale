import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../common/auth/AuthContext";

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
      />
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
  messages: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"
      />
    </svg>
  ),
  disponibilites: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"
      />
    </svg>
  ),
  carte: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 5v14h18V5H3zm16 12H5V7h14v10zM7 9h6v2H7V9zm0 4h10v2H7v-2z"
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
  parametres: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"
      />
    </svg>
  ),
};

const NAV_PRIMARY = [
  { id: "dashboard", label: "Tableau de bord", to: "/admin/dashboard", ready: true },
  { id: "reservations", label: "Réservations", ready: false },
  { id: "messages", label: "Messages", ready: false },
  { id: "disponibilites", label: "Disponibilités", ready: false },
  { id: "carte", label: "Carte & prix", ready: false },
];

const NAV_SECONDARY = [
  { id: "profil", label: "Profil", ready: false },
  { id: "parametres", label: "Paramètres", ready: false },
];

function NavItems({ items, active }) {
  return items.map((item) =>
    item.ready ? (
      <Link
        key={item.id}
        to={item.to}
        className={`admin-shell__nav-item${active === item.id ? " is-active" : ""}`}
      >
        <span className="admin-shell__nav-icon">{ICONS[item.id]}</span>
        <span className="admin-shell__nav-label">{item.label}</span>
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

function AdminShell({ active = "dashboard", title = "Tableau de bord", children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin", { replace: true });
  }

  const displayName =
    user?.nom?.trim() ||
    (user?.email ? user.email.split("@")[0] : "Admin");
  const firstName = displayName.split(" ")[0];
  const initial = (firstName || "A").charAt(0).toUpperCase();

  return (
    <div className="admin-shell">
      <aside className="admin-shell__rail" aria-label="Navigation admin">
        <div className="admin-shell__brand">
          <img
            src="/images/logo-round.png"
            alt=""
            className="admin-shell__logo"
            width={56}
            height={56}
          />
          <div className="admin-shell__brand-text">
            <p className="admin-shell__brand-name">La Maison Orientale</p>
            <p className="admin-shell__welcome">
              <span>Bienvenue</span> {firstName}
            </p>
          </div>
        </div>

        <nav className="admin-shell__nav">
          <p className="admin-shell__nav-section">Pilotage</p>
          <NavItems items={NAV_PRIMARY} active={active} />
          <p className="admin-shell__nav-section">Compte</p>
          <NavItems items={NAV_SECONDARY} active={active} />
        </nav>

        <div className="admin-shell__rail-foot">
          <div className="admin-shell__who">
            <span className="admin-shell__who-avatar" aria-hidden="true">
              {initial}
            </span>
            <div>
              <strong>{displayName}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button type="button" className="admin-shell__logout" onClick={handleLogout}>
            Déconnexion
          </button>
          <Link to="/" className="admin-shell__site">
            Voir le site public
          </Link>
        </div>
      </aside>

      <div className="admin-shell__main">
        <header className="admin-shell__topbar">
          <div className="admin-shell__top-copy">
            <p className="admin-shell__crumbs">
              Admin <span aria-hidden="true">/</span> {title}
            </p>
            <h1 className="admin-shell__hello">
              Bienvenue, <em>{firstName}</em>
            </h1>
            <p className="admin-shell__top-title">{title}</p>
          </div>
          <div className="admin-shell__top-user">
            <span className="admin-shell__avatar" aria-hidden="true">
              {initial}
            </span>
            <div className="admin-shell__top-user-meta">
              <strong>{displayName}</strong>
              <small>Administrateur</small>
            </div>
          </div>
        </header>
        <div className="admin-shell__content">{children}</div>
      </div>
    </div>
  );
}

export default AdminShell;
