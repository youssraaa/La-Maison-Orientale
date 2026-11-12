import { formatPrice } from "../../menu/data/menuData";
import OrderCheckoutFlow from "./OrderCheckoutFlow";
import OrderModeToggle from "./OrderModeToggle";

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="16" height="16">
      <path
        d="M4 7h16M9 7V5h6v2M10 11v6M14 11v6M6 7l1 13h10l1-13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OrderCartPanel({
  items,
  totalPrice,
  deliveryFee = 0,
  orderTotal,
  totalItems,
  mode,
  onModeChange,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  onAddSuggestion,
  suggestions = [],
  checkout = false,
  checkoutProps = null,
  minimumOrderMessage = null,
  minimumOrderBanner = null,
}) {
  const payableTotal = orderTotal ?? totalPrice + deliveryFee;

  function renderTotals() {
    return (
      <div className="order-cart__totals">
        <div className="order-cart__total-row order-cart__total-row--sub">
          <span>Sous-total</span>
          <strong>{formatPrice(totalPrice)}</strong>
        </div>
        {deliveryFee > 0 ? (
          <div className="order-cart__total-row order-cart__total-row--sub">
            <span>Frais de livraison</span>
            <strong>{formatPrice(deliveryFee)}</strong>
          </div>
        ) : null}
        <div className="order-cart__total-row order-cart__total-row--grand">
          <span>Total</span>
          <strong>{formatPrice(payableTotal)}</strong>
        </div>
        {mode === "EMPORTER" ? (
          <p className="order-cart__pay-note order-cart__pay-note--pickup">Aucun supplément pour l&apos;emporter.</p>
        ) : deliveryFee > 0 ? (
          <p className="order-cart__pay-note">Frais de livraison inclus dans le total.</p>
        ) : (
          <p className="order-cart__pay-note">Livraison sans frais supplémentaires.</p>
        )}
      </div>
    );
  }

  if (checkout && checkoutProps) {
    return (
      <aside className="order-cart order-cart--checkout" aria-label="Paiement">
        <div className="order-cart__panel order-cart__panel--checkout">
          <div className="order-cart__panel-body order-cart__panel-body--checkout">
            <OrderCheckoutFlow {...checkoutProps} embedded />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="order-cart" aria-label="Panier">
      <div className="order-cart__panel">
        <header className="order-cart__head">
          <p className="order-cart__step">Étape 1 · Panier</p>
          <h2 className="order-cart__title order-cart__title--center">Panier</h2>
        </header>

        <div className="order-cart__panel-body">
          <div className="order-cart__block order-cart__block--mode">
            <OrderModeToggle mode={mode} onModeChange={onModeChange} />

            {minimumOrderBanner ? (
              <p className="order-cart__minimum-banner" role="status">
                Livraison : minimum <strong>{formatPrice(minimumOrderBanner.minimum)}</strong> de plats
                {" "}
                <span className="order-cart__minimum-banner-note">(hors frais de livraison)</span>
                {" · "}
                il vous manque <strong>{formatPrice(minimumOrderBanner.remaining)}</strong>
              </p>
            ) : null}
          </div>

          {items.length === 0 ? (
            <div className="order-cart__block order-cart__block--empty">
              <div className="order-cart__empty">
              <span className="order-cart__empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 7h15l-1.5 10H7.5L6 7Z"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                  />
                  <path d="M6 7l1-3h3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </span>
              <p>Remplissez votre panier</p>
              <span>Ajoutez des plats savoureux depuis la carte.</span>
              </div>
            </div>
          ) : (
            <>
              <div className="order-cart__block order-cart__block--items">
                <h3 className="order-cart__block-title">Vos articles</h3>
                <ul className="order-cart__items">
                {items.map((item) => (
                  <li key={item.lineId} className="order-cart__item">
                    <div className="order-cart__item-row">
                      <div className="order-cart__item-copy">
                        <span className="order-cart__item-name">{item.nom}</span>
                        {item.optionsSummary ? (
                          <span className="order-cart__item-options">{item.optionsSummary}</span>
                        ) : null}
                      </div>
                      <span className="order-cart__item-price">{formatPrice(item.prix * item.quantite)}</span>
                    </div>
                    <div className="order-cart__item-actions">
                      <div className="order-cart__stepper">
                        <button
                          type="button"
                          className="order-cart__stepper-remove"
                          onClick={() =>
                            item.quantite <= 1
                              ? onRemoveItem(item.lineId)
                              : onUpdateQuantity(item.lineId, item.quantite - 1)
                          }
                          aria-label={item.quantite <= 1 ? "Retirer" : "Diminuer"}
                        >
                          {item.quantite <= 1 ? <TrashIcon /> : "−"}
                        </button>
                        <span>{item.quantite}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.lineId, item.quantite + 1)}
                          aria-label="Augmenter"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
                </ul>
              </div>

              {suggestions.length > 0 ? (
                <div className="order-cart__block order-cart__block--upsell">
                  <section className="order-cart__upsell" aria-label="Suggestions">
                    <h3 className="order-cart__upsell-title">Avez-vous vu…</h3>
                  <ul className="order-cart__upsell-list">
                    {suggestions.map((item) => (
                      <li key={item.id}>
                        <div className="order-cart__upsell-item">
                          <div>
                            <strong>{item.name}</strong>
                            {item.description ? <p>{item.description}</p> : null}
                            <span>{formatPrice(item.price)}</span>
                          </div>
                          <button
                            type="button"
                            className="order-cart__upsell-add"
                            onClick={() => onAddSuggestion?.(item)}
                            aria-label={`Ajouter ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  </section>
                </div>
              ) : null}

              <div className="order-cart__block order-cart__block--totals">{renderTotals()}</div>
            </>
          )}
        </div>

        {items.length > 0 ? (
          <button
            type="button"
            className="order-cart__submit"
            onClick={onCheckout}
            disabled={Boolean(minimumOrderMessage)}
          >
            Passer la commande
          </button>
        ) : null}
      </div>
    </aside>
  );
}

export default OrderCartPanel;
