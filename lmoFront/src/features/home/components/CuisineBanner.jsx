import useRestaurantInfo from "../../../common/hooks/useRestaurantInfo";

function CuisineBanner() {
  const { info } = useRestaurantInfo();
  const { services } = info;

  return (
    <section className="cuisine-banner">
      <div className="cuisine-banner__inner">
        <p className="section-kicker section-kicker--light">Sur la carte</p>
        <h2>
          Des saveurs qui restent en
          <br />
          mémoire
        </h2>
        <p>
          Notre restaurant syrien vous invite à découvrir les saveurs du
          Moyen-Orient&nbsp;!
        </p>
        <ul className="cuisine-banner__services" aria-label="Modes de service">
          {services.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
        <ul className="cuisine-banner__tags" aria-label="Spécialités">
          <li>Shawarma</li>
          <li>Grillades mixtes</li>
          <li>Houmous &amp; taboulé</li>
          <li>Café syrien</li>
          <li>Thé à la menthe</li>
        </ul>
      </div>
    </section>
  );
}

export default CuisineBanner;
