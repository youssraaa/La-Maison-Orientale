import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../common/auth/AuthContext";

const CARDS = [
  {
    title: "Réservations",
    text: "Voir, confirmer ou refuser les demandes du jour.",
    status: "Prochaine étape",
  },
  {
    title: "Messages contact",
    text: "Suivre les messages reçus via le formulaire du site.",
    status: "À venir",
  },
  {
    title: "Horaires & infos",
    text: "Mettre à jour les horaires affichés sur le site.",
    status: "À venir",
  },
];

function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin", { replace: true });
  }

  return (
    <main className="admin-dash">
      <header className="admin-dash__top">
        <div>
          <p className="admin-dash__eyebrow">La Maison Orientale · Espace admin</p>
          <h1>Tableau de bord</h1>
          <p className="admin-dash__lead">
            Connecté en tant que <strong>{user?.nom || user?.email}</strong>
            {user?.email ? ` (${user.email})` : ""}. Session protégée par JWT.
          </p>
        </div>
        <div className="admin-dash__actions">
          <button type="button" className="admin-dash__link" onClick={handleLogout}>
            Se déconnecter
          </button>
          <Link to="/" className="admin-dash__link admin-dash__link--ghost">
            Voir le site
          </Link>
        </div>
      </header>

      <section className="admin-dash__grid" aria-label="Modules admin">
        {CARDS.map((card) => (
          <article key={card.title} className="admin-dash__card">
            <p className="admin-dash__badge">{card.status}</p>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default AdminDashboardPage;
