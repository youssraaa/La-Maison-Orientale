import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useClientAuth } from "../auth/ClientAuthContext";
import NavButtonIcon from "./NavButtonIcons";

function PublicNavbar() {
  const { isClientAuthenticated, user } = useClientAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const accountLabel = (() => {
    if (!isClientAuthenticated) return "Connexion";
    const nom = user?.nom?.trim();
    if (!nom) return "Mon espace";
    return nom.split(/\s+/)[0];
  })();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("navbar-menu-open", menuOpen);
    return () => document.body.classList.remove("navbar-menu-open");
  }, [menuOpen]);

  return (
    <header className={`navbar${menuOpen ? " navbar--open" : ""}`}>
      <Link to="/" className="navbar__logo">
        <img
          src="/images/logo-nav.png"
          width={58}
          height={58}
          alt=""
          aria-hidden
        />
        <span>La Maison Orientale</span>
      </Link>

      <button
        type="button"
        className="navbar__toggle"
        aria-expanded={menuOpen}
        aria-controls="navbar-panel"
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span className="navbar__toggle-bar" aria-hidden="true" />
        <span className="navbar__toggle-bar" aria-hidden="true" />
        <span className="navbar__toggle-bar" aria-hidden="true" />
      </button>

      <div id="navbar-panel" className="navbar__panel">
        <nav className="navbar__nav" aria-label="Navigation principale">
          <NavLink to="/" end>
            Accueil
          </NavLink>
          <NavLink to="/menu" end>
            Carte
          </NavLink>
          <NavLink to="/galerie" end>
            Galerie
          </NavLink>
          <NavLink to="/contact" end>
            Contact
          </NavLink>
        </nav>

        <div className="navbar__actions">
          <Link
            to={isClientAuthenticated ? "/mon-compte" : "/connexion"}
            className="navbar__btn navbar__btn--ghost navbar__btn--account"
            title={isClientAuthenticated && user?.nom ? user.nom : undefined}
          >
            <NavButtonIcon name="user" />
            <span>{accountLabel}</span>
          </Link>
          <Link to="/reservation" className="navbar__btn navbar__btn--burgundy">
            <NavButtonIcon name="calendar" />
            <span>Réserver</span>
          </Link>
          <Link
            to="/commander"
            className="navbar__btn navbar__btn--gold navbar__btn--cart"
            title="Commander en ligne"
          >
            <NavButtonIcon name="cart" />
            <span>Commander</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default PublicNavbar;
