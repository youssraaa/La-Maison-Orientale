import PublicNavbar from "../../../common/components/PublicNavbar";
import ContactForm from "../components/ContactForm";
import { restaurantInfo } from "../../../common/data/restaurantInfo";

function ContactPage() {
  const { name, address, phone, email, hours } = restaurantInfo;

  return (
    <main className="page contact-page">
      <PublicNavbar />
      <section className="page__hero">
        <h1>Contact</h1>
        <p>Nous sommes à votre écoute pour toute demande de renseignement.</p>
      </section>

      <div className="contact-layout">
        <aside className="contact-info">
          <h2>{name}</h2>
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
          </dl>
        </aside>

        <section className="contact-panel">
          <h2>Envoyer un message</h2>
          <p className="contact-panel__lead">
            Réservation de groupe, allergènes, événement privé… Écrivez-nous,
            nous vous répondrons rapidement.
          </p>
          <ContactForm />
        </section>
      </div>
    </main>
  );
}

export default ContactPage;
