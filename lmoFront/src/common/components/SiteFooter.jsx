import { Link } from "react-router-dom";
import { restaurantInfo } from "../data/restaurantInfo";

function SiteFooter() {
  const { name, address, phone, email } = restaurantInfo;

  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div className="site-footer__brand-block">
          <img
            className="site-footer__logo"
            src="/images/logo-footer.png"
            alt={name}
          />
        </div>

        <div>
          <p className="site-footer__heading">Nous trouver</p>
          <p>{address.street}</p>
          <p>{address.city}</p>
          <p>
            <a href={phone.href}>{phone.display}</a>
          </p>
          <p>
            <a href={email.href}>{email.display}</a>
          </p>
        </div>

        <div className="site-footer__col-contact">
          <p className="site-footer__heading">Une question ?</p>
          <p className="site-footer__contact-text">
            Écrivez-nous ou passez nous voir — on est là pour vous répondre.
          </p>
          <Link to="/contact" className="site-footer__contact-link">
            Contactez-nous →
          </Link>
        </div>

        <div className="site-footer__col-explore">
          <p className="site-footer__heading">Explorer</p>
          <nav className="site-footer__nav">
            <Link to="/menu">La carte</Link>
            <Link to="/galerie">Galerie</Link>
            <Link to="/reservation">Réserver</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>
      </div>

      <p className="site-footer__copy">
        © {new Date().getFullYear()} {name}
      </p>
    </footer>
  );
}

export default SiteFooter;
