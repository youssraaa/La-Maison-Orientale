import { Link } from "react-router-dom";
import { useClientPortal } from "../components/ClientPortalLayout";
import {
  IconArrowRight,
  IconBag,
  IconBell,
  IconCalendar,
  IconHelp,
  IconMenu,
  IconUser,
} from "../components/ClientPortalIcons";
import { formatMemberSince, isUpcomingReservation } from "../hooks/useClientAccountData";

const SPACE_LINKS = [
  {
    to: "/mon-compte/reservations",
    label: "Mes réservations",
    desc: "Consultez vos tables à venir et votre historique.",
    icon: IconCalendar,
  },
  {
    to: "/mon-compte/commandes",
    label: "Mes commandes",
    desc: "Suivez vos commandes en cours et passées.",
    icon: IconBag,
  },
  {
    to: "/mon-compte/profil",
    label: "Mon profil",
    desc: "Mettez à jour vos informations personnelles.",
    icon: IconUser,
  },
  {
    to: "/mon-compte/messages",
    label: "Mes messages",
    desc: "Retrouvez les notifications du restaurant.",
    icon: IconBell,
  },
  {
    to: "/carte",
    label: "Notre carte",
    desc: "Parcourez nos spécialités orientales.",
    icon: IconMenu,
  },
  {
    to: "/contact",
    label: "Aide & contact",
    desc: "Une question ? Contactez notre équipe.",
    icon: IconHelp,
  },
];

function displayPrenom(profile, user) {
  if (profile?.prenom) return profile.prenom.trim();
  return (profile?.nom || user?.nom || "").trim().split(/\s+/)[0] || "";
}

function profileCompletion(profile) {
  if (!profile) return 0;
  const fields = [
    profile.prenom,
    profile.nom,
    profile.email,
    profile.telephone,
    profile.adresse,
    profile.pays,
  ];
  const filled = fields.filter((v) => String(v || "").trim()).length;
  return Math.round((filled / fields.length) * 100);
}

export default function ClientDashboardPage() {
  const { profile, user, reservations, commandes, info } = useClientPortal();
  const prenom = displayPrenom(profile, user);
  const upcoming = reservations.filter(isUpcomingReservation);
  const restaurantName = info?.name || "La Maison Orientale";
  const completion = profileCompletion(profile);

  return (
    <div className="client-home client-home--hub">
      <div className="client-home__welcome-row">
        <header className="client-home__welcome-main">
          <p className="client-home__kicker">
            Mon espace · {restaurantName}
          </p>
          <h1>
            Bienvenue,{prenom ? <> <span>{prenom}</span></> : null}
          </h1>
          <p className="client-home__intro">
            Retrouvez ici vos réservations, vos commandes et vos informations personnelles.
          </p>
          <Link to="/mon-compte/profil" className="client-home__profile-link">
            Gérer mon profil
            <IconArrowRight />
          </Link>
        </header>

        <aside className="client-home__summary-card" aria-label="Résumé du compte">
          <p className="client-home__summary-brand">{restaurantName}</p>
          <p className="client-home__summary-tag">Espace client</p>
          <div className="client-home__summary-stats">
            <div>
              <strong>{upcoming.length}</strong>
              <span>Réservations</span>
            </div>
            <div>
              <strong>{commandes.length}</strong>
              <span>Commandes</span>
            </div>
          </div>
          {profile?.createdAt ? (
            <p className="client-home__summary-since">{formatMemberSince(profile.createdAt)}</p>
          ) : null}
          <div className="client-home__summary-progress">
            <div className="client-home__summary-progress-head">
              <span>Profil complété</span>
              <strong>{completion}%</strong>
            </div>
            <div className="client-home__summary-progress-bar" role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${completion}%` }} />
            </div>
          </div>
        </aside>
      </div>

      <section className="client-home__action-tiles" aria-label="Actions principales">
        <Link to="/reservation" className="client-home__tile client-home__tile--reserve">
          <p className="client-home__tile-kicker">Réserver</p>
          <h2>Une table vous attend</h2>
          <p>Choisissez date, heure et nombre de couverts.</p>
          <span className="client-home__tile-go" aria-hidden="true">
            <IconArrowRight />
          </span>
        </Link>
        <Link to="/commander" className="client-home__tile client-home__tile--order">
          <p className="client-home__tile-kicker">Commander</p>
          <h2>À emporter ou livraison</h2>
          <p>Composez votre panier et payez en ligne.</p>
          <span className="client-home__tile-go" aria-hidden="true">
            <IconArrowRight />
          </span>
        </Link>
      </section>

      <section className="client-home__space" aria-label="Espace personnel">
        <h2 className="client-home__space-title">Votre espace personnel</h2>
        <ul className="client-home__space-grid">
          {SPACE_LINKS.map(({ to, label, desc, icon: Icon }) => (
            <li key={to}>
              <Link to={to} className="client-home__space-card">
                <span className="client-home__space-icon" aria-hidden="true">
                  <Icon />
                </span>
                <h3>{label}</h3>
                <p>{desc}</p>
                <span className="client-home__space-go" aria-hidden="true">
                  <IconArrowRight />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
