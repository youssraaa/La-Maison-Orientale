import PublicNavbar from "../../../common/components/PublicNavbar";
import ReservationForm from "../components/ReservationForm";

function ReservationPage() {
  return (
    <main className="page contact-page">
      <PublicNavbar />
      <section className="page__hero">
        <h1>Réservation</h1>
        <p>Réservez votre table en ligne, nous confirmons votre venue.</p>
      </section>

      <div className="contact-layout">
        <aside className="contact-info">
          <h2>Bon à savoir</h2>
          <dl className="contact-info__list">
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
            <div>
              <dt>Grandes tablées</dt>
              <dd>
                Pour un groupe de plus de 30 personnes ou un événement privé,
                appelez-nous directement.
              </dd>
            </div>
            <div>
              <dt>Téléphone</dt>
              <dd>
                <a href="tel:+32470123456">+32 470 12 34 56</a>
              </dd>
            </div>
          </dl>
        </aside>

        <section className="contact-panel">
          <h2>Demander une réservation</h2>
          <p className="contact-panel__lead">
            Indiquez la date, l&apos;heure et le nombre de convives. Votre
            demande est enregistrée puis confirmée par le restaurant.
          </p>
          <ReservationForm />
        </section>
      </div>
    </main>
  );
}

export default ReservationPage;
