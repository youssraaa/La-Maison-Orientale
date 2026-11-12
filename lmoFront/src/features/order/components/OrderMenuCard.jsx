import { formatPrice } from "../../menu/data/menuData";

function OrderMenuCard({ item, image, quantity, onAdd, onOpen, modeUnavailable }) {
  const canOrder = Boolean(item.id) && item.price != null && !modeUnavailable;
  const handleOpen = onOpen || onAdd;

  return (
    <article className={`order-card${canOrder ? " order-card--interactive" : ""}${modeUnavailable ? " order-card--mode-unavail" : ""}`}>
      <button
        type="button"
        className="order-card__body order-card__body-btn"
        onClick={canOrder ? handleOpen : undefined}
        disabled={!canOrder}
      >
        <div className="order-card__headline">
          <h3 className="order-card__name">{item.name}</h3>
          {item.description ? (
            <span className="order-card__info" title={item.description} aria-label="Description">
              i
            </span>
          ) : null}
        </div>
        {item.price != null ? (
          <p className="order-card__price">{formatPrice(item.price)}</p>
        ) : null}
        {item.description ? (
          <p className="order-card__desc">{item.description}</p>
        ) : null}
        {modeUnavailable ? (
          <span className="order-card__unavail-badge">
            Indisponible {modeUnavailable === "EMPORTER" ? "à emporter" : "en livraison"}
          </span>
        ) : null}
      </button>
      <div className="order-card__aside">
        {image && canOrder ? (
          <div className="order-card__thumb">
            <img src={image} alt={item.name} loading="lazy" />
            {quantity > 0 ? (
              <span className="order-card__qty-badge" aria-hidden="true">
                {quantity > 9 ? "9+" : quantity}
              </span>
            ) : null}
            <button
              type="button"
              className="order-card__add"
              onClick={handleOpen}
              aria-label={`Ajouter ${item.name}`}
            >
              +
            </button>
          </div>
        ) : canOrder ? (
          <button
            type="button"
            className="order-card__add order-card__add--solo"
            onClick={handleOpen}
            aria-label={`Ajouter ${item.name}`}
          >
            +
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default OrderMenuCard;
