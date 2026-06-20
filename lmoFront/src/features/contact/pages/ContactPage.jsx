import PublicNavbar from "../../../common/components/PublicNavbar";
import ContactForm from "../components/ContactForm";

function ContactPage() {
  return (
    <main className="page contact-page">
      <PublicNavbar />
      <section className="page__hero">
        <h1>Contact</h1>
        <p>Nous sommes à votre écoute pour toute demande de renseignement.</p>
      </section>

      <div className="contact-layout">
        <aside className="contact-info">
          <h2>La Maison Orientale</h2>
          <dl className="contact-info__list">
            <div>
              <dt>Adresse</dt>
              <dd>Rue de la Station 12, 7390 Quaregnon</dd>
            </div>
            <div>
              <dt>Téléphone</dt>
              <dd>
                <a href="tel:+32470123456">+32 470 12 34 56</a>
              </dd>
            </div>
            <div>
              <dt>E-mail</dt>
              <dd>
                <a href="mailto:contact@lamaisonorientale.be">
                  contact@lamaisonorientale.be
                </a>
              </dd>
            </div>
            <div>
              <dt>Horaires</dt>
              <dd>
                Mardi – Dimanche
                <br />
                Midi : 11h30 – 14h30
                <br />
                Soir : 18h00 – 22h00
                <br />
                <span className="contact-info__closed">Fermé le lundi</span>
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
