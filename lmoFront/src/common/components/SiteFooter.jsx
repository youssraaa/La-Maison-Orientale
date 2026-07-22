import { Link } from "react-router-dom";
import { restaurantInfo } from "../data/restaurantInfo";

function SocialIcon({ id }) {
  if (id === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6m9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10m0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
        />
      </svg>
    );
  }

  if (id === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M16.6 5.8c.8.9 1.4 2 1.6 3.2.9.1 1.8.4 2.6.8v2.5a6.6 6.6 0 0 1-2.6-.7v5.7a6.2 6.2 0 1 1-6.2-6.2c.3 0 .6 0 .9.1v2.7a3.5 3.5 0 1 0 2.4 3.3V2h2.8c.1 1.4.5 2.6 1.5 3.8Z"
        />
      </svg>
    );
  }

  return null;
}

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
