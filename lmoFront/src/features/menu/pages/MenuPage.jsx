import { Link } from "react-router-dom";
import PublicNavbar from "../../../common/components/PublicNavbar";
import MenuCategorySection from "../components/MenuCategorySection";
import { menuCategories } from "../data/menuData";

function MenuPage() {
  return (
    <main className="page menu-page">
      <PublicNavbar />
      <section className="page__hero">
        <h1>La carte</h1>
        <p>
          Entrées, sandwichs, plats et boissons — cuisine syrienne faite maison
          à Quaregnon.
        </p>
      </section>

      <nav className="menu-nav" aria-label="Sections de la carte">
        <div className="menu-nav__inner">
          {menuCategories.map((cat) => (
            <a key={cat.id} href={`#${cat.id}`}>
              {cat.title}
            </a>
          ))}
        </div>
      </nav>

      <div className="menu-body">
        {menuCategories.map((category) => (
          <MenuCategorySection key={category.id} {...category} />
        ))}
      </div>

      <section className="menu-cta">
        <div className="menu-cta__inner">
          <p>Envie de déguster ? Réservez votre table en ligne.</p>
          <Link to="/reservation" className="btn btn--accent">
            Réserver une table
          </Link>
        </div>
      </section>
    </main>
  );
}

export default MenuPage;
