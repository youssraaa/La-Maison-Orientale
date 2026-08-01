import { Link } from "react-router-dom";

const moments = [
  {
    src: "/images/gallery/photo-0914.png",
    alt: "Entrées et salades de La Maison Orientale",
    title: "Entrées savoureuses",
    text: "Hommos, moutabal, fattouche, warak enab et entrées chaudes pour ouvrir l’appétit.",
  },
  {
    src: "/images/mixed-grill.png",
    alt: "Plats et grillades au charbon",
    title: "Plats généreux",
    text: "Shawarmas, sandwichs et grillades au charbon, généreux et parfumés.",
  },
  {
    src: "/images/drinks-mint.png",
    alt: "Boissons et thé à la menthe",
    title: "Café, thé & boissons",
    text: "Café syrien authentique, thé à la menthe et boissons froides pour accompagner le repas.",
  },
];

function SignatureMoments() {
  return (
    <section className="signature-moments">
      <div className="signature-moments__intro">
        <p className="section-kicker">À table</p>
        <h2>Ce qui vous attend</h2>
        <p>
          Notre carte vous accueille pour un déjeuner, un dîner, un emporter ou
          une livraison. Entrées, plats, sandwichs et boissons, dans une
          ambiance chaleureuse.
        </p>
      </div>

      <div className="signature-moments__grid">
        {moments.map((item) => (
          <article key={item.title} className="signature-moment">
            <div className="signature-moment__media">
              <img src={item.src} alt={item.alt} loading="lazy" />
            </div>
            <div className="signature-moment__body">
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="signature-moments__cta">
        <Link to="/menu" className="btn btn--accent">
          Voir toute la carte
        </Link>
      </div>
    </section>
  );
}

export default SignatureMoments;
