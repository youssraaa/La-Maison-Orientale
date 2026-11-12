import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { restaurantInfo } from "../../../common/data/restaurantInfo";
import { getPaymentMethodLabel } from "../../order/utils/paymentMethods";
import { openOrderReceiptPreview } from "../../order/utils/printOrderReceipt";
import ClientStatusBadge from "./ClientStatusBadge";
import { formatDateTime, formatMode } from "../hooks/useClientAccountData";

function formatEuro(amount) {
  return `${Number(amount || 0).toFixed(2).replace(".", ",")} €`;
}

export default function ClientCommandeDetailModal({ open, commande, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => closeRef.current?.focus(), 30);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open || !commande) return null;

  const lignes = Array.isArray(commande.lignes) ? commande.lignes : [];
  const isDelivery = commande.mode === "LIVRAISON";
  const hasReceipt = lignes.length > 0;

  return createPortal(
    <div
      className="client-res-modal__overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className="client-res-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-cmd-modal-title"
      >
        <header className="client-res-modal__head">
          <div>
            <p className="client-res-modal__kicker">Commande en ligne</p>
            <h2 id="client-cmd-modal-title">Détails de la commande</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="client-res-modal__close"
            aria-label="Fermer"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="client-res-modal__body">
          <div className="client-res-modal__summary">
            <div>
              <h3>{commande.reference || "Commande"}</h3>
              <p>Passée le {formatDateTime(commande.createdAt)}</p>
            </div>
            <ClientStatusBadge statut={commande.statut} />
          </div>

          <dl className="client-res-modal__grid">
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
              <div className="client-res-modal__span2">
                <dt>Adresse de livraison</dt>
                <dd>{commande.adresseLivraison}</dd>
              </div>
            ) : null}
            {commande.commentaire ? (
              <div className="client-res-modal__span2">
                <dt>Note</dt>
                <dd>{commande.commentaire}</dd>
              </div>
            ) : null}
          </dl>

          {hasReceipt ? (
            <section className="client-res-modal__lines">
              <h4>Articles commandés</h4>
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
              <p className="client-res-modal__lines-total">
                Total <strong>{formatEuro(commande.total)}</strong>
              </p>
            </section>
          ) : null}

          <section className="client-res-modal__note">
            <h4>Modifier ou annuler ?</h4>
            <p>
              Pour toute modification ou annulation, appelez le restaurant au{" "}
              <a href={restaurantInfo.phone.href}>{restaurantInfo.phone.display}</a>.
            </p>
          </section>

          {hasReceipt ? (
            <div className="client-res-modal__actions client-res-modal__actions--center">
              <button
                type="button"
                className="client-home__action client-home__action--primary"
                onClick={() => openOrderReceiptPreview(commande)}
              >
                Voir la facture
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
}
