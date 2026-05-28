import MenuItemRow from "./MenuItemRow";

function MenuCategorySection({ id, title, note, items, subsections }) {
  const isSauces = id === "sauces";

  return (
    <section id={id} className="menu-category">
      <header className="menu-category__header">
        <h2 className="menu-category__title">{title}</h2>
        {note && <p className="menu-category__note">{note}</p>}
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
            <li key={item.name}>{item.name}</li>
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
