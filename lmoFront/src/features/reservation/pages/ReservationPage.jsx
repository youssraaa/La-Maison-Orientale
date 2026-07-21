import PublicNavbar from "../../../common/components/PublicNavbar";
import ReservationForm from "../components/ReservationForm";
import { restaurantInfo } from "../../../common/data/restaurantInfo";

function ReservationPage() {
  const { phone, hours, address } = restaurantInfo;

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
              <dt>Adresse</dt>
              <dd>{address.full}</dd>
            </div>
            <div>
              <dt>Horaires</dt>
              <dd>{hours.summary}</dd>
            </div>
            <div>
              <dt>Grandes tablées</dt>
              <dd>
                Pour un groupe de plus de 30 personnes ou un événement privé,
                appelez-nous directement.
              </dd>
            </div>
            {phone?.display && (
              <div>
                <dt>Téléphone</dt>
                <dd>
                  <a href={phone.href}>{phone.display}</a>
                </dd>
              </div>
            )}
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
