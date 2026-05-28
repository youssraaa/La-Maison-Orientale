import { formatPrice } from "../data/menuData";

function MenuItemRow({ name, description, price }) {
  return (
    <article className="menu-item">
      <div className="menu-item__main">
        <h3 className="menu-item__name">{name}</h3>
        {description && (
          <p className="menu-item__description">{description}</p>
        )}
      </div>
      {price != null && (
        <span className="menu-item__price">{formatPrice(price)}</span>
      )}
    </article>
  );
}

export default MenuItemRow;
