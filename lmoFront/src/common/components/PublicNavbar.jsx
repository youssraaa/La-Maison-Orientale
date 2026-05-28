import { Link, NavLink } from "react-router-dom";

function PublicNavbar() {
  return (
    <header className="navbar">
      <nav className="navbar__links navbar__links--left">
        <NavLink to="/" end>
          Accueil
        </NavLink>
        <NavLink to="/menu" end>
          Carte
        </NavLink>
      </nav>

      <Link to="/" className="navbar__logo">
        <img src="/images/logo-round.png" alt="" aria-hidden />
        <span>La Maison Orientale</span>
      </Link>

      <nav className="navbar__links navbar__links--right">
        <NavLink to="/galerie" end>
          Galerie
        </NavLink>
        <NavLink to="/contact" end>
          Contact
        </NavLink>
        <Link to="/reservation" className="navbar__cta">
          Réserver
        </Link>
      </nav>
    </header>
  );
}

export default PublicNavbar;
