import PublicNavbar from "../../../common/components/PublicNavbar";
import SiteFooter from "../../../common/components/SiteFooter";
import SocialIcon from "../../../common/components/SocialIcon";
import ContactForm from "../components/ContactForm";
import { restaurantInfo } from "../../../common/data/restaurantInfo";

function ContactPage() {
  const { name, address, phone, email, hours, socials, services } =
    restaurantInfo;

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

      <div className="contact-sheet">
        <div className="contact-sheet__ornament" aria-hidden="true" />
        <p className="contact-sheet__brand">La Maison Orientale</p>

        <div className="contact-layout">
          <aside className="contact-info">
            <dl className="contact-info__list">
              <div>
                <dt>Adresse</dt>
                <dd>{address.full}</dd>
              </div>
              <div>
                <dt>Téléphone</dt>
                <dd>
                  <a href={phone.href}>{phone.display}</a>
                </dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>
                  <a href={email.href}>{email.display}</a>
                </dd>
              </div>
              <div>
                <dt>Horaires</dt>
                <dd>
                  {hours.schedule.map((row) => (
                    <span key={row.day} className="contact-info__hours-row">
                      {row.day} : {row.time}
                      <br />
                    </span>
                  ))}
                </dd>
              </div>
              {services?.length > 0 && (
                <div>
                  <dt>Service</dt>
                  <dd>{services.join(" · ")}</dd>
                </div>
              )}
            </dl>

            {socials?.length > 0 && (
              <div className="contact-info__socials">
                <p className="contact-info__socials-label">Suivez-nous</p>
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
            )}
          </aside>

          <section className="contact-panel">
            <h2>Envoyer un message</h2>
            <p className="contact-panel__lead">
              Une question, un anniversaire ou un événement ? Laissez-nous votre
              e-mail pour que nous puissions vous répondre, ou appelez-nous
              directement.
            </p>
            <ContactForm />
          </section>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}

export default ContactPage;
