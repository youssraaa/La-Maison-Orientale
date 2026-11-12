import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PublicNavbar from "../../../common/components/PublicNavbar";
import SiteFooter from "../../../common/components/SiteFooter";
import { restaurantInfo } from "../../../common/data/restaurantInfo";
import { fetchCommandeByToken } from "../api/commandeApi";
import { getPaymentMethodLabel } from "../utils/paymentMethods";
import { computeDeliveryEstimate, buildRouteMapEmbed, buildRestaurantMapEmbed } from "../utils/orderDeliveryEstimate";
import { openOrderReceiptPreview } from "../utils/printOrderReceipt";
import { formatPrice } from "../../menu/data/menuData";

function DeliveryHero({ active }) {
  return (
    <div
      className={`order-confirm-hero__visual${active ? " order-confirm-hero__visual--delivery" : " order-confirm-hero__visual--pickup"}`}
    >
      <img
        className="order-confirm-hero__logo"
        src="/images/logo-round.png"
        alt="La Maison Orientale"
      />
      <div className="order-confirm-hero__mode-icon" aria-hidden="true">
        {active ? (
          <svg className="order-confirm-hero__bike" viewBox="0 0 120 80">
            <circle cx="28" cy="58" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
            <circle cx="88" cy="58" r="10" fill="none" stroke="currentColor" strokeWidth="3" />
            <path
              d="M38 58h38M48 58l12-22h18l8 22"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="72" cy="24" r="8" fill="currentColor" opacity="0.85" />
            <path className="order-confirm-hero__road" d="M8 68h104" stroke="currentColor" strokeWidth="2" strokeDasharray="6 8" />
          </svg>
        ) : (
          <svg className="order-confirm-hero__bag" viewBox="0 0 80 80">
            <path d="M20 28h40l-4 38H24L20 28Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
            <path d="M32 28v-6c0-4 4-8 8-8s8 4 8 8v6" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
        )}
      </div>
    </div>
  );
}

function modeLabel(mode) {
  return mode === "LIVRAISON" ? "Livraison" : "Emporter";
}

function formatWhen(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("fr-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function OrderConfirmationPage() {
  const { token } = useParams();
  const [commande, setCommande] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);

  const isDelivery = commande?.mode === "LIVRAISON";

  useEffect(() => {
    fetchCommandeByToken(token)
      .then(setCommande)
      .catch((err) => setError(err.message || "Commande introuvable."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!commande?.adresseLivraison || commande.mode !== "LIVRAISON") {
      setDeliveryEstimate(null);
      return;
    }
    let cancelled = false;
    computeDeliveryEstimate(commande.adresseLivraison).then((estimate) => {
      if (!cancelled) setDeliveryEstimate(estimate);
    });
    return () => {
      cancelled = true;
    };
  }, [commande]);

  const mapSrc = useMemo(() => {
    if (!isDelivery || !commande?.adresseLivraison) return null;
    return buildRouteMapEmbed(commande.adresseLivraison);
  }, [isDelivery, commande?.adresseLivraison]);

  return (
    <main className="page order-confirm-page">
      <PublicNavbar />

      <div className="order-confirm-page__body">
        {loading ? (
          <p className="order-confirm-loading">Chargement de votre commande…</p>
        ) : null}

        {error ? (
          <section className="order-confirm-error">
            <h1>Commande introuvable</h1>
            <p>{error}</p>
            <Link to="/commander" className="order-confirm-btn">
              Nouvelle commande
            </Link>
          </section>
        ) : null}

        {commande ? (
          <article className="order-confirm" id="order-receipt">
            <header className="order-confirm-hero">
              <DeliveryHero active={isDelivery} />
              <div className="order-confirm-hero__text">
                <p className="order-confirm-hero__kicker">Merci pour votre confiance</p>
                <h1>Commande confirmée</h1>
                <p className="order-confirm-hero__ref">
                  Référence <strong>{commande.reference}</strong>
                </p>
                <span className="order-confirm-hero__badge">{commande.statut}</span>
              </div>
            </header>

            <div className="order-confirm__layout">
              <div className="order-confirm__main">
                <section className="order-confirm-card">
                  <h2>Récapitulatif</h2>
                  <dl className="order-confirm-meta">
                    <div>
                      <dt>Mode</dt>
                      <dd>{modeLabel(commande.mode)}</dd>
                    </div>
                    <div>
                      <dt>Passée le</dt>
                      <dd>{formatWhen(commande.createdAt)}</dd>
                    </div>
                    <div>
                      <dt>Paiement</dt>
                      <dd>{getPaymentMethodLabel(commande.modePaiement)}</dd>
                    </div>
                    <div>
                      <dt>Client</dt>
                      <dd>{commande.nomClient}</dd>
                    </div>
                    {commande.commentaire ? (
                      <div>
                        <dt>Note</dt>
                        <dd>{commande.commentaire}</dd>
                      </div>
                    ) : null}
                  </dl>

                  <ul className="order-confirm-lines">
                    {(commande.lignes || []).map((l, i) => (
                      <li key={`${l.nom}-${i}`}>
                        <span>
                          {l.quantite}× {l.nom}
                        </span>
                        <strong>{formatPrice(Number(l.sousTotal))}</strong>
                      </li>
                    ))}
                  </ul>
                  <p className="order-confirm-total">
                    Total <strong>{formatPrice(Number(commande.total))}</strong>
                  </p>
                </section>

                <section className="order-confirm-card order-confirm-card--contact">
                  <h2>Modifier ou annuler ?</h2>
                  <p>
                    Pour toute modification ou annulation, merci d&apos;appeler directement le restaurant.
                  </p>
                  <a href={restaurantInfo.phone.href} className="order-confirm-call">
                    Appeler {restaurantInfo.phone.display}
                  </a>
                </section>
              </div>

              {isDelivery ? (
                <aside className="order-confirm__aside order-confirm-card order-confirm-card--map">
                  <h2>Suivi livraison</h2>
                  <p className="order-confirm-card__lead">Itinéraire vers votre adresse :</p>
                  <p className="order-confirm-address">{commande.adresseLivraison}</p>

                  {deliveryEstimate?.distanceKm != null ? (
                    <div className="order-confirm-stats">
                      <div>
                        <span>Distance</span>
                        <strong>{deliveryEstimate.distanceKm} km</strong>
                      </div>
                      <div>
                        <span>Délai estimé</span>
                        <strong>
                          {deliveryEstimate.window.min}–{deliveryEstimate.window.max} min
                        </strong>
                      </div>
                    </div>
                  ) : (
                    <p className="order-confirm-stats-fallback">Estimation en cours… (25–45 min)</p>
                  )}

                  {mapSrc ? (
                    <div className="order-confirm-map">
                      <iframe title="Itinéraire livraison" loading="lazy" src={mapSrc} />
                    </div>
                  ) : null}

                  <p className="order-confirm-from">
                    Au départ de : {restaurantInfo.address.full}
                  </p>
                </aside>
              ) : (
                <aside className="order-confirm__aside order-confirm-card order-confirm-card--pickup order-confirm-card--map">
                  <h2>Retrait au restaurant</h2>
                  <p className="order-confirm-card__lead">
                    Votre commande sera prête dans environ <strong>15 minutes</strong>.
                  </p>
                  <p className="order-confirm-address">{restaurantInfo.address.full}</p>

                  <div className="order-confirm-map order-confirm-map--pickup">
                    <iframe
                      title="Localisation du restaurant"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src={buildRestaurantMapEmbed()}
                    />
                  </div>

                  <a
                    href={restaurantInfo.map.googleDirections}
                    className="order-confirm-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Voir l&apos;itinéraire
                  </a>
                </aside>
              )}
            </div>

            <div className="order-confirm-actions no-print">
              <button
                type="button"
                className="order-confirm-btn order-confirm-btn--gold"
                onClick={() => openOrderReceiptPreview(commande)}
              >
                Voir votre facture
              </button>
              <Link to="/commander" className="order-confirm-btn">
                Nouvelle commande
              </Link>
              <Link to="/" className="order-confirm-btn order-confirm-btn--ghost">
                Accueil
              </Link>
            </div>
          </article>
        ) : null}
      </div>

      <SiteFooter />
    </main>
  );
}
