import { Link, NavLink } from "react-router-dom";

function PublicNavbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar__logo">
        <img src="/images/logo-round.png" alt="" aria-hidden />
        <span>La Maison Orientale</span>
      </Link>

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
        <Link to="/reservation" className="navbar__btn navbar__btn--ghost">
          Réserver
        </Link>
        <Link to="/menu" className="navbar__btn navbar__btn--gold">
          Commander
        </Link>
      </div>
    </header>
  );
}

export default PublicNavbar;
