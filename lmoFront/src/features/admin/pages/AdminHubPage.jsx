import { Link } from "react-router-dom";
import { useAuth } from "../../../common/auth/AuthContext";
import AdminShell from "../components/AdminShell";

const TILES = [
  {
    id: "agents",
    to: "/admin/agents",
    title: "Agents",
    desc: "Invitations, comptes et réinitialisations",
    accent: "agents",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
        />
      </svg>
    ),
  },
  {
    id: "notifications",
    to: "/admin/notifications",
    title: "Notifications",
    desc: "Alertes réservations et messages",
    accent: "notifications",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
        />
      </svg>
    ),
  },
  {
    id: "horaires",
    to: "/admin/horaires",
    title: "Horaires & fermetures",
    desc: "Ouverture hebdo et jours exceptionnels",
    accent: "horaires",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
        />
      </svg>
    ),
  },
  {
    id: "restaurant",
    to: "/admin/restaurant",
    title: "Paramètres restaurant",
    desc: "Capacité, créneaux et réservations",
    accent: "restaurant",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
        />
      </svg>
    ),
  },
  {
    id: "compte",
    to: "/admin/compte",
    title: "Mon compte",
    desc: "Profil, mot de passe et préférences",
    accent: "compte",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
        />
      </svg>
    ),
  },
  {
    id: "dashboard",
    to: "/admin/dashboard",
    title: "Tableau de bord",
    desc: "Statistiques, graphiques et export PDF",
    accent: "dashboard",
    tag: "En cours d'amélioration",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
        />
      </svg>
    ),
  },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function AdminHubPage() {
  const { user } = useAuth();
  const firstName = (user?.nom || "Admin").split(" ")[0];

  return (
    <AdminShell active="accueil" title="Accueil">
      <main className="admin-dash admin-hub">
        <section className="admin-hub__hero">
          <p className="admin-hub__eyebrow">Espace administration · La Maison Orientale</p>
          <h2>
            {greeting()}, {firstName}
          </h2>
          <p>
            Gérez votre équipe, les horaires, les paramètres et suivez l'activité
            du restaurant — tout depuis un seul endroit.
          </p>
        </section>

        <div className="admin-hub__grid">
          {TILES.map((tile) => (
            <Link
              key={tile.id}
              to={tile.to}
              className={`admin-hub__tile admin-hub__tile--${tile.accent}`}
            >
              <span className="admin-hub__tile-icon">{tile.icon}</span>
              <h3>{tile.title}</h3>
              <p>{tile.desc}</p>
              {tile.tag ? <span className="admin-hub__tile-tag">{tile.tag}</span> : null}
              <span className="admin-hub__cta">Ouvrir →</span>
            </Link>
          ))}
        </div>
      </main>
    </AdminShell>
  );
}

export default AdminHubPage;
