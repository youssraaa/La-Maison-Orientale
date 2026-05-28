import PublicNavbar from "../../../common/components/PublicNavbar";

function ReservationPage() {
  return (
    <main className="page">
      <PublicNavbar />
      <section className="page__hero">
        <h1>Réservation</h1>
        <p>Choisissez votre date et confirmez votre venue en ligne.</p>
      </section>

      <section className="section-card">
        <h2>Formulaire de réservation</h2>
        <p>
          Cette page est prête pour la prochaine étape : intégration du
          formulaire (nom, téléphone, date, heure, personnes).
        </p>
      </section>
    </main>
  );
}

export default ReservationPage;
