import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { restaurantInfo } from "../../../common/data/restaurantInfo";
import { getPaymentMethodLabel } from "../../order/utils/paymentMethods";
import { openOrderReceiptPreview } from "../../order/utils/printOrderReceipt";
import ClientPageShell from "../components/ClientPageShell";
import ClientStatusBadge from "../components/ClientStatusBadge";
import { IconBag } from "../components/ClientPortalIcons";
import { useClientPortal } from "../components/ClientPortalLayout";
import { formatDateTime, formatMode } from "../hooks/useClientAccountData";
import { findCommandeByRef } from "../utils/clientPortalPaths";

function formatEuro(amount) {
  return `${Number(amount || 0).toFixed(2).replace(".", ",")} €`;
}

export default function ClientCommandeDetailPage() {
  const { ref } = useParams();
  const { commandes } = useClientPortal();

  const commande = useMemo(() => findCommandeByRef(commandes, ref), [commandes, ref]);

  if (!commande) {
    return (
      <ClientPageShell
        title="Commande introuvable"
        lead="Commande introuvable dans votre espace."
        icon={IconBag}
      >
        <div className="client-portal-empty client-portal-empty--action">
          <p>La commande demandée est introuvable ou n'est plus liée à votre compte.</p>
          <Link to="/mon-compte/commandes" className="client-home__action client-home__action--ghost">
            Retour à mes commandes
          </Link>
        </div>
      </ClientPageShell>
    );
  }

  const lignes = Array.isArray(commande.lignes) ? commande.lignes : [];
  const isDelivery = commande.mode === "LIVRAISON";

  return (
    <ClientPageShell
      pageClass="client-page--commandes"
      title={commande.reference || "Commande"}
      icon={IconBag}
      lead={`Passée le ${formatDateTime(commande.createdAt)}`}
      action={
        <Link to="/mon-compte/commandes" className="client-home__action client-home__action--ghost">
          ← Mes commandes
        </Link>
      }
    >
      <article className="client-detail-card">
        <header className="client-detail-card__head">
          <div>
            <p className="client-detail-card__kicker">Commande en ligne</p>
            <h2 className="client-detail-card__title">{commande.reference || "Commande"}</h2>
            <p className="client-detail-card__ref">Passée le {formatDateTime(commande.createdAt)}</p>
          </div>
          <ClientStatusBadge statut={commande.statut} />
        </header>

        <dl className="client-detail-card__grid">
          <div>
            <dt>Mode</dt>
            <dd>{formatMode(commande.mode)}</dd>
          </div>
          <div>
            <dt>Paiement</dt>
            <dd>{getPaymentMethodLabel(commande.modePaiement)}</dd>
          </div>
          <div>
            <dt>Client</dt>
            <dd>{commande.nomClient || "—"}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{formatEuro(commande.total)}</dd>
          </div>
          {isDelivery && commande.adresseLivraison ? (
            <div className="client-detail-card__span2">
              <dt>Adresse de livraison</dt>
              <dd>{commande.adresseLivraison}</dd>
            </div>
          ) : null}
          {commande.commentaire ? (
            <div className="client-detail-card__span2">
              <dt>Note</dt>
              <dd>{commande.commentaire}</dd>
            </div>
          ) : null}
        </dl>

        {lignes.length > 0 ? (
          <section className="client-detail-card__lines">
            <h3>Articles commandés</h3>
            <ul>
              {lignes.map((line, index) => (
                <li key={`${line.nom}-${index}`}>
                  <span>
                    {line.quantite}× {line.nom}
                  </span>
                  <strong>{formatEuro(line.sousTotal)}</strong>
                </li>
              ))}
            </ul>
            <p className="client-detail-card__total">
              Total <strong>{formatEuro(commande.total)}</strong>
            </p>
          </section>
        ) : null}

        <section className="client-detail-card__contact">
          <h3>Modifier ou annuler ?</h3>
          <p>
            Pour toute modification ou annulation, merci d&apos;appeler directement le restaurant au{" "}
            <a href={restaurantInfo.phone.href}>{restaurantInfo.phone.display}</a>.
          </p>
        </section>

        <div className="client-detail-card__actions">
          {lignes.length > 0 ? (
            <button
              type="button"
              className="client-home__action client-home__action--primary"
              onClick={() => openOrderReceiptPreview(commande)}
            >
              Voir la facture
            </button>
          ) : null}
          <Link to="/commander" className="client-home__action client-home__action--ghost">
            Nouvelle commande
          </Link>
        </div>
      </article>
    </ClientPageShell>
  );
}
