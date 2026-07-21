import { Link } from "react-router-dom";

function ReserveCtaBand() {
  return (
    <section className="reserve-cta" aria-labelledby="reserve-cta-title">
      <div className="reserve-cta__veil" aria-hidden="true" />
      <div className="reserve-cta__inner">
        <p className="section-kicker section-kicker--light">Réservation</p>
        <h2 id="reserve-cta-title" className="reserve-cta__title">
          Votre table vous attend
        </h2>
        <p className="reserve-cta__text">
          Réservez en quelques clics et venez déguster l’Orient à Quaregnon.
        </p>
        <Link to="/reservation" className="btn btn--gold">
          Réserver en ligne
        </Link>
      </div>
    </section>
  );
}

export default ReserveCtaBand;
