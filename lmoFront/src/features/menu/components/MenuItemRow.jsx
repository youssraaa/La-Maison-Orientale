import { formatPrice } from "../data/menuData";

function MenuItemRow({ id, name, description, price, featured, onAdd }) {
  return (
    <article className={`menu-item${featured ? " menu-item--featured" : ""}`}>
      <div className="menu-item__row">
        <h3 className="menu-item__name">{name}</h3>
        <span className="menu-item__leader" aria-hidden="true" />
        {price != null && (
          <span className="menu-item__price">{formatPrice(price)}</span>
        )}
        {id && onAdd && (
          <button type="button" className="menu-item__add" onClick={() => onAdd({ id, name, price })}>
            +
          </button>
        )}
      </div>
      {description && (
        <p className="menu-item__description">{description}</p>
      )}
    </article>
  );
}

export default MenuItemRow;
