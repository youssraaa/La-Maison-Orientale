import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../../../common/components/PublicNavbar";
import SiteFooter from "../../../common/components/SiteFooter";
import { fetchPublicMenu } from "../../admin/api/publicContentApi";
import MenuCategorySection from "../components/MenuCategorySection";
import { menuCategories as fallbackCategories } from "../data/menuData";
import { countMenuItems, mapApiCategory } from "../utils/menuUtils";

function MenuPage() {
  const [categories, setCategories] = useState(fallbackCategories);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPublicMenu()
      .then((cats) => {
        if (cancelled || !cats.length) return;
        const mapped = cats.map(mapApiCategory);
        if (countMenuItems(mapped) > 0) {
          setCategories(mapped);
        }
      })
      .catch(() => {
        /* conserve le fallback local */
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
          {categories.map((cat) => (
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
          {!loaded ? (
            <p className="menu-ops-loading" aria-live="polite">
              Chargement de la carte…
            </p>
          ) : null}
          {categories.map((category) => (
            <MenuCategorySection key={category.id} {...category} />
          ))}
        </div>

        <section className="menu-cta">
          <div className="menu-cta__inner">
            <p>Prêt à commander ? Parcourez nos plats puis finalisez votre commande en ligne.</p>
            <Link to="/commander" className="btn btn--accent">
              Commander
            </Link>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}

export default MenuPage;
