import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../common/auth/AuthContext";

const NAV = [
  { id: "dashboard", label: "Tableau de bord", to: "/admin/dashboard", ready: true },
  { id: "reservations", label: "Réservations", ready: false },
  { id: "messages", label: "Messages", ready: false },
  { id: "disponibilites", label: "Disponibilités", ready: false },
  { id: "carte", label: "Carte & prix", ready: false },
  { id: "profil", label: "Profil", ready: false },
  { id: "parametres", label: "Paramètres", ready: false },
];

function AdminShell({ active = "dashboard", children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin", { replace: true });
  }

  const firstName = (user?.nom || user?.email || "Admin").split(" ")[0];

  return (
    <div className="admin-shell">
      <aside className="admin-shell__rail" aria-label="Navigation admin">
        <div className="admin-shell__brand">
          <img
            src="/images/logo-round.png"
            alt=""
            className="admin-shell__logo"
            width={44}
            height={44}
          />
          <div>
            <p className="admin-shell__brand-name">La Maison Orientale</p>
            <p className="admin-shell__brand-tag">Pupitre admin</p>
          </div>
        </div>

        <nav className="admin-shell__nav">
          {NAV.map((item) =>
            item.ready ? (
              <Link
                key={item.id}
                to={item.to}
                className={`admin-shell__nav-item${
                  active === item.id ? " is-active" : ""
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.id}
                className="admin-shell__nav-item admin-shell__nav-item--soon"
                title="Bientôt disponible"
              >
                {item.label}
                <em>bientôt</em>
              </span>
            )
          )}
        </nav>

        <div className="admin-shell__rail-foot">
          <p className="admin-shell__who">
            <span>{firstName}</span>
            <small>{user?.email}</small>
          </p>
          <button type="button" className="admin-shell__logout" onClick={handleLogout}>
            Se déconnecter
          </button>
          <Link to="/" className="admin-shell__site">
            Voir le site public
          </Link>
        </div>
      </aside>

      <div className="admin-shell__main">{children}</div>
    </div>
  );
}

export default AdminShell;
