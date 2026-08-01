import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Diaporama accueil — une seule image.
 * Photo d’équipe : uniquement dans « Notre histoire ».
 */
const slides = [
  {
    id: "accueil",
    layout: "full",
    images: [
      {
        src: "/images/hero-accueil.png",
        alt: "Mezzés et spécialités de La Maison Orientale",
      },
    ],
  },
];

function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, []);

  const goTo = (next) => setIndex((next + slides.length) % slides.length);

  return (
    <section id="accueil" className="hero hero--slideshow">
      <div className="hero__slides" aria-hidden>
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`hero__frame hero__frame--${slide.layout} ${
              i === index ? "is-active" : ""
            }`}
          >
            {slide.images.map((image) => (
              <figure key={image.src} className="hero__cell">
                <img
                  src={image.src}
                  alt={image.alt}
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "auto"}
                />
              </figure>
            ))}
          </div>
        ))}
        <div className="hero__veil" />
      </div>

      <div className="hero__content hero__content--center">
        <p className="hero__eyebrow">Restaurant &amp; Snack</p>
        <h1 className="hero__title">
          La Maison&nbsp;<span className="hero__title-accent">Orientale</span>
        </h1>
        <p className="hero__script">L’Orient dans votre assiette</p>
        <p className="hero__lead">
          Notre restaurant syrien vous invite à découvrir les saveurs
          authentiques du Moyen-Orient. Sur place, à emporter ou en livraison,
          on vous accueille à Quaregnon dans une ambiance chaleureuse.
        </p>
        <div className="hero__actions">
          <Link to="/reservation" className="btn btn--gold">
            Réserver une table
          </Link>
          <Link to="/menu" className="btn btn--ghost">
            Voir la carte
          </Link>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="hero__controls">
          <button
            type="button"
            className="hero__arrow"
            aria-label="Image précédente"
            onClick={() => goTo(index - 1)}
          >
            ‹
          </button>
          <div className="hero__dots" role="tablist" aria-label="Diaporama">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Diapositive ${i + 1}`}
                className={`hero__dot ${i === index ? "is-active" : ""}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="hero__arrow"
            aria-label="Image suivante"
            onClick={() => goTo(index + 1)}
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}

export default HeroSection;
