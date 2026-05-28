import PublicNavbar from "../../../common/components/PublicNavbar";

function ContactPage() {
  return (
    <main className="page">
      <PublicNavbar />
      <section className="page__hero">
        <h1>Contact</h1>
        <p>Nous sommes à votre écoute pour toute demande de renseignement.</p>
      </section>

      <section className="section-card">
        <p>
          <strong>Adresse :</strong> Quaregnon, Belgique
        </p>
        <p>
          <strong>Téléphone :</strong> +32 XX XX XX XX
        </p>
        <p>
          <strong>Horaires :</strong> Mardi – Dimanche, midi et soir
        </p>
      </section>
    </main>
  );
}

export default ContactPage;
