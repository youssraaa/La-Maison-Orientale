import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <section id="accueil" className="hero hero--split">
      <div className="hero__content">
        <p className="hero__label">Restaurant — Quaregnon</p>
        <h1 className="hero__title">La Maison Orientale</h1>
        <p className="hero__lead">
          Cuisine syrienne authentique, ambiance chaleureuse et hospitalité
          sincère — une table pour savourer le Levant.
        </p>
        <div className="hero__actions">
          <Link to="/reservation" className="btn btn--gold">
            Réserver
          </Link>
          <Link to="/menu" className="btn btn--ghost">
            La carte
          </Link>
        </div>
      </div>
      <div className="hero__media">
        <img
          src="/images/storefront.png"
          alt="Façade du restaurant La Maison Orientale"
        />
      </div>
    </section>
  );
}

export default HeroSection;
