import { Link } from "react-router-dom";
import PublicNavbar from "../../../common/components/PublicNavbar";
import SiteFooter from "../../../common/components/SiteFooter";
import MenuCategorySection from "../components/MenuCategorySection";
import { menuCategories } from "../data/menuData";

function MenuPage() {
  return (
    <main className="page menu-page">
      <PublicNavbar />

      <section className="page__hero page__hero--menu">
        <p className="page__hero-kicker">Restaurant & snack</p>
        <h1>La carte</h1>
        <p>
          Mezzés, shawarmas et grillades de La Maison Orientale, à Quaregnon.
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

      <div className="menu-sheet">
        <div className="menu-sheet__ornament" aria-hidden="true" />
        <p className="menu-sheet__brand">La Maison Orientale</p>
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
      </div>

      <SiteFooter />
    </main>
  );
}

export default MenuPage;
