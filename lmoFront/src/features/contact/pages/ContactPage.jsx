import PublicNavbar from "../../../common/components/PublicNavbar";
import SiteFooter from "../../../common/components/SiteFooter";
import SocialIcon from "../../../common/components/SocialIcon";
import ContactForm from "../components/ContactForm";
import ContactIcon from "../components/ContactIcons";
import useRestaurantInfo from "../../../common/hooks/useRestaurantInfo";

function ContactPage() {
  const { info } = useRestaurantInfo();
  const { name, address, phone, email, hours, socials, services } = info;

  return (
    <main className="page contact-page">
      <PublicNavbar />

      <section className="page__hero page__hero--contact">
        <p className="page__hero-kicker">Écrivez-nous</p>
        <h1>Contact</h1>
        <p>
          Une question, une envie de privatiser une table ? La Maison Orientale
          vous répond avec plaisir.
        </p>
      </section>

      <div className="contact-wrap">
        <aside className="contact-info">
          <h2 className="contact-info__title">Nous trouver</h2>
          <p className="contact-info__intro">
            Retrouvez nos coordonnées ou écrivez-nous via le formulaire.
          </p>

          <ul className="contact-info__items">
            <li className="contact-info__item">
              <span className="contact-info__icon" aria-hidden="true">
                <ContactIcon name="pin" />
              </span>
              <div>
                <p className="contact-info__label">Adresse</p>
                <p className="contact-info__value">{address.full}</p>
              </div>
            </li>
            <li className="contact-info__item">
              <span className="contact-info__icon" aria-hidden="true">
                <ContactIcon name="phone" />
              </span>
              <div>
                <p className="contact-info__label">Téléphone</p>
                <p className="contact-info__value">
                  <a href={phone.href}>{phone.display}</a>
                </p>
              </div>
            </li>
            <li className="contact-info__item">
              <span className="contact-info__icon" aria-hidden="true">
                <ContactIcon name="mail" />
              </span>
              <div>
                <p className="contact-info__label">E-mail</p>
                <p className="contact-info__value">
                  <a href={email.href}>{email.display}</a>
                </p>
              </div>
            </li>
            <li className="contact-info__item">
              <span className="contact-info__icon" aria-hidden="true">
                <ContactIcon name="clock" />
              </span>
              <div>
                <p className="contact-info__label">Horaires</p>
                <p className="contact-info__value">
                  {hours.schedule.map((row) => (
                    <span key={row.day} className="contact-info__hours-row">
                      {row.day} : {row.time}
                      <br />
                    </span>
                  ))}
                </p>
              </div>
            </li>
            {services?.length > 0 ? (
              <li className="contact-info__item">
                <span className="contact-info__icon" aria-hidden="true">
                  <ContactIcon name="service" />
                </span>
                <div>
                  <p className="contact-info__label">Services</p>
                  <p className="contact-info__value">{services.join(" · ")}</p>
                </div>
              </li>
            ) : null}
          </ul>

          {socials?.length > 0 ? (
            <div className="contact-info__socials">
              <p className="contact-info__label">Suivez-nous</p>
              <ul className="contact-info__social-list">
                {socials.map((social) => (
                  <li key={social.id}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-info__social-link"
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
          ) : null}
        </aside>

        <section className="contact-panel">
          <div className="contact-panel__head">
            <span className="contact-panel__badge" aria-hidden="true">
              <ContactIcon name="message" />
            </span>
            <div>
              <h2>Envoyer un message</h2>
              <p className="contact-panel__lead">
                Une question, un anniversaire ou un événement ? Remplissez le
                formulaire ci-dessous. Nous vous répondrons dans les plus brefs
                délais&nbsp;!
              </p>
            </div>
          </div>
          <ContactForm />
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}

export default ContactPage;
