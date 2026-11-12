import { Link } from "react-router-dom";
import { useMemo } from "react";
import { restaurantInfo } from "../../../common/data/restaurantInfo";
import { useClientPortal } from "../components/ClientPortalLayout";
import ClientStatusBadge from "../components/ClientStatusBadge";
import {
  IconBag,
  IconBell,
  IconCalendar,
  IconHelp,
  IconMail,
  IconMenu,
  IconUser,
} from "../components/ClientPortalIcons";
import {
  formatDateTime,
  formatMemberSince,
  formatMode,
  formatReservationDate,
  formatShortDate,
  isUpcomingReservation,
} from "../hooks/useClientAccountData";
import { getPaymentMethodLabel } from "../../order/utils/paymentMethods";

const QUICK_LINKS = [
  { to: "/mon-compte/reservations", label: "Mes réservations", icon: IconCalendar },
  { to: "/mon-compte/commandes", label: "Mes commandes", icon: IconBag },
  { to: "/mon-compte/messages", label: "Contacter le restaurant", icon: IconMail },
  { to: "/mon-compte/notifications", label: "Mes notifications", icon: IconBell },
  { to: "/mon-compte/profil", label: "Mon profil", icon: IconUser },
  { to: "/carte", label: "Notre carte", icon: IconMenu },
  { to: "/contact", label: "Aide & contact", icon: IconHelp },
];

function displayPrenom(profile, user) {
  if (profile?.prenom) return profile.prenom.trim();
  return (profile?.nom || user?.nom || "").trim().split(/\s+/)[0] || "";
}

function displayNomComplet(profile, user) {
  const full = [profile?.prenom, profile?.nom].filter(Boolean).join(" ").trim();
  return full || profile?.nom || user?.nom || "";
}

function profileCompletion(profile) {
  if (!profile) return 0;
  const fields = [profile.prenom, profile.nom, profile.email, profile.telephone, profile.adresse, profile.pays];
  const filled = fields.filter((v) => String(v || "").trim()).length;
  return Math.round((filled / fields.length) * 100);
}

function reservationTimestamp(reservation) {
  const time = String(reservation.heure || "00:00").slice(0, 5);
  return new Date(`${reservation.date}T${time}:00`).getTime();
}

function formatHeureLabel(heure) {
  const value = String(heure || "").slice(0, 5);
  if (!value) return "—";
  return value.replace(":", "h");
}

function formatEuro(amount) {
  return `${Number(amount || 0).toFixed(2).replace(".", ",")} €`;
}

function commandeItemCount(commande) {
  return (commande.lignes || []).reduce((sum, line) => sum + (Number(line.quantite) || 0), 0);
}

function commandeItemsPreview(commande, max = 2) {
  const lignes = commande.lignes || [];
  if (lignes.length === 0) return null;
  const preview = lignes
    .slice(0, max)
    .map((line) => `${line.quantite}× ${line.nom}`)
    .join(" · ");
  const remaining = lignes.length - max;
  return remaining > 0 ? `${preview} · +${remaining} autre${remaining > 1 ? "s" : ""}` : preview;
}

function isPastReservation(reservation) {
  if (!reservation?.date) return false;
  return reservationTimestamp(reservation) < Date.now();
}

function DashboardReservationItem({ reservation, compact = false }) {
  const people = Number(reservation.nbPersonnes) || 0;
  const comment = String(reservation.commentaire || "").trim();

  if (compact === "past") {
    return (
      <li className="client-dash__feed-item client-dash__feed-item--past">
        <div className="client-dash__feed-head client-dash__feed-head--past">
          <div>
            <p className="client-dash__feed-kicker">Visite passée</p>
            <h3 className="client-dash__feed-title">{formatReservationDate(reservation.date)}</h3>
            <p className="client-dash__feed-subtitle">Réf. #{reservation.id || "—"}</p>
          </div>
          <ClientStatusBadge statut={reservation.statut} />
        </div>

        <dl className="client-dash__feed-grid client-dash__feed-grid--past">
          <div className="client-dash__feed-field">
            <dt>Heure</dt>
            <dd>{formatHeureLabel(reservation.heure)}</dd>
          </div>
          <div className="client-dash__feed-field">
            <dt>Convives</dt>
            <dd>
              {people} personne{people > 1 ? "s" : ""}
            </dd>
          </div>
          <div className="client-dash__feed-field">
            <dt>Au nom de</dt>
            <dd>{reservation.nomClient || "—"}</dd>
          </div>
        </dl>

        {comment ? <p className="client-dash__feed-note client-dash__feed-note--past">Note : {comment}</p> : null}
      </li>
    );
  }

  if (compact) {
    return (
      <li className="client-dash__feed-item client-dash__feed-item--compact">
        <div className="client-dash__feed-row">
          <div className="client-dash__feed-row-copy">
            <strong>{formatShortDate(reservation.date)} · {formatHeureLabel(reservation.heure)}</strong>
            <span>
              {people} personne{people > 1 ? "s" : ""}
              {reservation.nomClient ? ` · ${reservation.nomClient}` : ""}
            </span>
          </div>
          <ClientStatusBadge statut={reservation.statut} />
        </div>
      </li>
    );
  }

  return (
    <li className="client-dash__feed-item">
      <div className="client-dash__feed-head">
        <div>
          <p className="client-dash__feed-kicker">Table au restaurant</p>
          <h3 className="client-dash__feed-title">{formatReservationDate(reservation.date)}</h3>
          <p className="client-dash__feed-subtitle">Réf. #{reservation.id || "—"}</p>
        </div>
        <ClientStatusBadge statut={reservation.statut} />
      </div>

      <dl className="client-dash__feed-grid">
        <div className="client-dash__feed-field">
          <dt>Heure</dt>
          <dd>{formatHeureLabel(reservation.heure)}</dd>
        </div>
        <div className="client-dash__feed-field">
          <dt>Convives</dt>
          <dd>
            {people} personne{people > 1 ? "s" : ""}
          </dd>
        </div>
        <div className="client-dash__feed-field">
          <dt>Date</dt>
          <dd>{formatShortDate(reservation.date)}</dd>
        </div>
        <div className="client-dash__feed-field">
          <dt>Au nom de</dt>
          <dd>{reservation.nomClient || "—"}</dd>
        </div>
      </dl>

      {comment ? <p className="client-dash__feed-note">Note : {comment}</p> : null}
    </li>
  );
}

function DashboardCommandeItem({ commande }) {
  const itemCount = commandeItemCount(commande);
  const itemsPreview = commandeItemsPreview(commande);

  return (
    <li className="client-dash__feed-item">
      <div className="client-dash__feed-head">
        <div>
          <p className="client-dash__feed-kicker">Commande en ligne</p>
          <h3 className="client-dash__feed-title">{commande.reference || "Commande"}</h3>
          <p className="client-dash__feed-subtitle">
            Passée le {formatDateTime(commande.createdAt)}
          </p>
        </div>
        <ClientStatusBadge statut={commande.statut} />
      </div>

      <dl className="client-dash__feed-grid client-dash__feed-grid--3">
        <div className="client-dash__feed-field">
          <dt>Mode</dt>
          <dd>{formatMode(commande.mode)}</dd>
        </div>
        <div className="client-dash__feed-field">
          <dt>Total</dt>
          <dd>{formatEuro(commande.total)}</dd>
        </div>
        <div className="client-dash__feed-field">
          <dt>Articles</dt>
          <dd>{itemCount > 0 ? `${itemCount} article${itemCount > 1 ? "s" : ""}` : "—"}</dd>
        </div>
        <div className="client-dash__feed-field">
          <dt>Paiement</dt>
          <dd>{getPaymentMethodLabel(commande.modePaiement)}</dd>
        </div>
      </dl>

      {itemsPreview ? <p className="client-dash__feed-note">{itemsPreview}</p> : null}
    </li>
  );
}

function FeedBlock({ title, tone = "upcoming", children }) {
  return (
    <div className="client-dash__feed-block">
      <h3 className={`client-dash__feed-block-title client-dash__feed-block-title--${tone}`}>{title}</h3>
      {children}
    </div>
  );
}

function ActivityList({ items, emptyMessage, emptyCta, emptyCtaTo, compact = false }) {
  if (items.length === 0) {
    return (
      <div className={compact ? "client-dash__empty client-dash__empty--inline" : "client-dash__empty"}>
        <p>{emptyMessage}</p>
        {emptyCta && emptyCtaTo ? (
          <Link to={emptyCtaTo} className={compact ? "client-dash__feed-link" : "client-dash__empty-cta"}>
            {emptyCta}
          </Link>
        ) : null}
      </div>
    );
  }

  return <ul className="client-dash__feed">{items}</ul>;
}

export default function ClientDashboardPage() {
  const { profile, user, reservations, commandes } = useClientPortal();
  const prenom = displayPrenom(profile, user);
  const nomComplet = displayNomComplet(profile, user);
  const upcomingCount = reservations.filter(isUpcomingReservation).length;
  const completion = profileCompletion(profile);
  const memberSince = profile?.createdAt ? formatMemberSince(profile.createdAt) : "";
  const profileEmail = profile?.email || user?.email || "";
  const profilePhone = profile?.telephone || "";

  const upcomingReservations = useMemo(
    () =>
      [...reservations]
        .filter(isUpcomingReservation)
        .sort((a, b) => reservationTimestamp(a) - reservationTimestamp(b))
        .slice(0, 3),
    [reservations]
  );

  const pastReservations = useMemo(
    () =>
      [...reservations]
        .filter(isPastReservation)
        .sort((a, b) => reservationTimestamp(b) - reservationTimestamp(a))
        .slice(0, 2),
    [reservations]
  );

  const recentCommandes = useMemo(
    () =>
      [...commandes]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 4),
    [commandes]
  );

  return (
    <div className="client-dash client-dash--ref">
      <header className="client-dash__banner" aria-label="Bienvenue">
        <div className="client-dash__banner-top">
          <div>
            <h1>
              Bienvenue{prenom ? <>, {prenom}</> : ""} !
            </h1>
            <p className="client-dash__banner-sub">
              {nomComplet}
              {memberSince ? ` · ${memberSince}` : ""}
            </p>
          </div>
        </div>

        <ul className="client-dash__stat-row" aria-label="Résumé">
          <li className="client-dash__stat-card">
            <span className="client-dash__stat-icon" aria-hidden="true">
              <IconCalendar />
            </span>
            <span className="client-dash__stat-copy">
              <strong>{upcomingCount}</strong>
              <em>Réservations à venir</em>
            </span>
          </li>
          <li className="client-dash__stat-card">
            <span className="client-dash__stat-icon" aria-hidden="true">
              <IconBag />
            </span>
            <span className="client-dash__stat-copy">
              <strong>{commandes.length}</strong>
              <em>Commandes</em>
            </span>
          </li>
          <li className="client-dash__stat-card">
            <span className="client-dash__stat-icon" aria-hidden="true">
              <IconUser />
            </span>
            <span className="client-dash__stat-copy">
              <strong>{completion}%</strong>
              <em>Profil complété</em>
            </span>
          </li>
        </ul>
      </header>

      <div className="client-dash__main">
        <div className="client-dash__grid">
          <div className="client-dash__col">
            <section className="client-dash__panel" aria-label="Actions rapides">
              <h2 className="client-dash__panel-title">Actions rapides</h2>
              <div className="client-dash__actions">
                <Link to="/reservation" className="client-dash__action client-dash__action--primary">
                  <IconCalendar />
                  Réserver une table
                </Link>
                <Link to="/commander" className="client-dash__action client-dash__action--primary">
                  <IconBag />
                  Commander en ligne
                </Link>
              </div>

              <div className="client-dash__extras">
                <h3 className="client-dash__extras-title">Autres accès</h3>
                <ul className="client-dash__quick-links">
                  {QUICK_LINKS.map(({ to, label, icon: Icon }) => (
                    <li key={to}>
                      <Link to={to} className="client-dash__quick-link">
                        <Icon />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <ul className="client-dash__info-list" aria-label="Informations utiles">
                  {profileEmail ? (
                    <li>
                      <span>E-mail</span>
                      <strong>{profileEmail}</strong>
                    </li>
                  ) : null}
                  {profilePhone ? (
                    <li>
                      <span>Téléphone</span>
                      <strong>{profilePhone}</strong>
                    </li>
                  ) : null}
                  <li>
                    <span>Restaurant</span>
                    <strong>
                      <a href={restaurantInfo.phone.href}>{restaurantInfo.phone.display}</a>
                    </strong>
                  </li>
                  <li>
                    <span>Adresse</span>
                    <strong>{restaurantInfo.address.full}</strong>
                  </li>
                  <li className="client-dash__info-list--profile">
                    <span>Profil</span>
                    <div className="client-dash__profile-inline">
                      <div className="client-dash__profile-bar" aria-hidden="true">
                        <span style={{ width: `${completion}%` }} />
                      </div>
                      <p>
                        {completion}% complété
                        {completion < 100 ? (
                          <>
                            {" · "}
                            <Link to="/mon-compte/profil">Compléter</Link>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <section className="client-dash__panel" aria-label="Dernières commandes">
              <div className="client-dash__panel-head">
                <h2 className="client-dash__panel-title">Dernières commandes</h2>
                {commandes.length > 0 ? (
                  <Link to="/mon-compte/commandes" className="client-dash__panel-link">
                    Tout voir
                  </Link>
                ) : null}
              </div>
              <ActivityList
                items={recentCommandes.map((commande) => (
                  <DashboardCommandeItem key={commande.id || commande.reference} commande={commande} />
                ))}
                emptyMessage="Aucune commande pour le moment."
                emptyCta="Commander en ligne"
                emptyCtaTo="/commander"
              />
              {commandes.length > 0 ? (
                <Link to="/mon-compte/commandes" className="client-dash__feed-link client-dash__feed-link--footer">
                  Voir toutes les commandes →
                </Link>
              ) : null}
            </section>
          </div>

          <section className="client-dash__panel client-dash__panel--tall" aria-label="Mes réservations">
            <div className="client-dash__panel-head">
              <h2 className="client-dash__panel-title">Mes réservations</h2>
              {reservations.length > 0 ? (
                <Link to="/mon-compte/reservations" className="client-dash__panel-link">
                  Tout voir
                </Link>
              ) : null}
            </div>

            {reservations.length === 0 ? (
              <ActivityList
                items={[]}
                emptyMessage="Aucune réservation pour le moment."
                emptyCta="Réserver une table"
                emptyCtaTo="/reservation"
              />
            ) : (
              <>
                <FeedBlock tone="upcoming" title="À venir">
                  <ActivityList
                    compact
                    items={upcomingReservations.map((reservation) => (
                      <DashboardReservationItem
                        key={reservation.id || `${reservation.date}-${reservation.heure}`}
                        reservation={reservation}
                      />
                    ))}
                    emptyMessage="Aucune réservation à venir."
                    emptyCta="Réserver une table"
                    emptyCtaTo="/reservation"
                  />
                </FeedBlock>

                {pastReservations.length > 0 ? (
                  <FeedBlock tone="past" title="Récemment passées">
                    <ul className="client-dash__feed client-dash__feed--past">
                      {pastReservations.map((reservation) => (
                        <DashboardReservationItem
                          key={`past-${reservation.id || `${reservation.date}-${reservation.heure}`}`}
                          reservation={reservation}
                          compact="past"
                        />
                      ))}
                    </ul>
                  </FeedBlock>
                ) : null}

                <Link to="/mon-compte/reservations" className="client-dash__feed-link client-dash__feed-link--footer">
                  Voir toutes les réservations →
                </Link>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
