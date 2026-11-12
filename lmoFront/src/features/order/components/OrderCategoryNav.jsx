function OrderCategoryNav({ categories, activeId, onSelect }) {
  return (
    <nav className="order-nav" aria-label="Catégories">
      <ul className="order-nav__list">
        {categories.map((cat) => (
          <li key={cat.id}>
            <a
              href={`#order-${cat.id}`}
              className={activeId === cat.id ? "is-active" : undefined}
              onClick={(e) => {
                e.preventDefault();
                onSelect(cat.id);
                document.getElementById(`order-${cat.id}`)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            >
              {cat.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default OrderCategoryNav;
