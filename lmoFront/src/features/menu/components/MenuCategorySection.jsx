import MenuItemRow from "./MenuItemRow";

function MenuCategorySection({ id, title, note, image, items, subsections }) {
  const isSauces = id === "sauces";

  return (
    <section id={id} className={`menu-category menu-category--${id}`}>
      <header className="menu-category__header">
        <div className="menu-category__rule" aria-hidden="true" />
        <div className="menu-category__brand">
          {image && (
            <div className="menu-category__avatar">
              <img src={image} alt="" loading="lazy" />
            </div>
          )}
          <div className="menu-category__heading">
            <h2 className="menu-category__title">{title}</h2>
            {note && <p className="menu-category__note">{note}</p>}
          </div>
        </div>
        <div className="menu-category__rule" aria-hidden="true" />
      </header>

      {subsections ? (
        <div className="menu-category__subsections">
          {subsections.map((sub) => (
            <div key={sub.title} className="menu-subsection">
              <h3 className="menu-subsection__title">{sub.title}</h3>
              <ul className="menu-category__list">
                {sub.items.map((item) => (
                  <li key={item.name}>
                    <MenuItemRow {...item} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : isSauces ? (
        <ul className="menu-sauces">
          {items.map((item) => (
            <li key={item.name}>
              <span>{item.name}</span>
              {item.price != null && (
                <span className="menu-sauces__price">
                  {Number(item.price).toFixed(2).replace(".", ",")} €
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <ul className="menu-category__list">
          {items.map((item) => (
            <li key={item.name}>
              <MenuItemRow {...item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default MenuCategorySection;
