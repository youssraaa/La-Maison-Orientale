import PublicNavbar from "../../../common/components/PublicNavbar";
import SiteFooter from "../../../common/components/SiteFooter";
import ReservationForm from "../components/ReservationForm";

function ReservationPage() {
  return (
    <main className="page reservation-page">
      <PublicNavbar />

      <section className="page__hero page__hero--reservation">
        <p className="page__hero-kicker">La Maison Orientale</p>
        <h1>Réservation</h1>
        <p>Une table confirmée dès que le créneau est libre.</p>
      </section>

      <div className="reservation-stage">
        <ReservationForm />
      </div>

      <SiteFooter />
    </main>
  );
}

export default ReservationPage;
