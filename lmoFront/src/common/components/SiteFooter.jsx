import { Link } from "react-router-dom";
import { restaurantInfo } from "../data/restaurantInfo";
import SocialIcon from "./SocialIcon";

function SiteFooter() {
  const { name, address, phone, email, socials } = restaurantInfo;

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
            Écrivez-nous ou passez nous voir, on est là pour vous répondre.
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

      {socials?.length > 0 && (
        <div className="site-footer__socials">
          <p className="site-footer__socials-label">Suivez-nous</p>
          <ul className="site-footer__social-list">
            {socials.map((social) => (
              <li key={social.id}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer__social-link"
                  aria-label={`${social.label} — ${name}`}
                  title={social.label}
                >
                  <SocialIcon id={social.id} />
                  <span>{social.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="site-footer__copy">
        © {new Date().getFullYear()} {name}
      </p>
    </footer>
  );
}

export default SiteFooter;
