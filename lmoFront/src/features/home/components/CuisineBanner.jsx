function CuisineBanner() {
  return (
    <section className="cuisine-banner">
      <div className="cuisine-banner__inner">
        <p className="section-kicker section-kicker--light">Sur la carte</p>
        <h2>Des saveurs qui restent en mémoire</h2>
        <p>
          Entrées, salades, shawarmas, plats et grillades, café syrien, thé et
          boissons : toute une carte pour se régaler, du début à la fin du
          repas.
        </p>
        <ul className="cuisine-banner__tags" aria-label="Spécialités">
          <li>Entrées savoureuses</li>
          <li>Plats généreux</li>
          <li>Sandwichs &amp; shawarmas parfumés</li>
          <li>Café syrien authentique</li>
          <li>Thé à la menthe</li>
          <li>Boissons froides</li>
        </ul>
      </div>
    </section>
  );
}

export default CuisineBanner;
