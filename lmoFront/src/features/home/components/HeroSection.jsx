import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * Diaporama : porte → terrasse → plats en paire.
 * Photo d’équipe : uniquement dans « Notre histoire ».
 */
const slides = [
  {
    id: "storefront",
    layout: "full",
    images: [
      {
        src: "/images/storefront.png",
        alt: "Façade La Maison Orientale — BBQ & Shawarma au charbon",
      },
    ],
  },
  {
    id: "terrace",
    layout: "full",
    images: [
      {
        src: "/images/e2753cef-27fe-435b-b822-68c7a87a15b5.JPG",
        alt: "Terrasse de La Maison Orientale",
      },
    ],
  },
  {
    id: "hospitality",
    layout: "pair",
    images: [
      {
        src: "/images/gallery/photo-1322.png",
        alt: "Thé à la menthe et hospitalité orientale",
      },
      {
        src: "/images/gallery/photo-8374.png",
        alt: "Bol de falafel au sésame",
      },
    ],
  },
  {
    id: "specialties",
    layout: "pair",
    images: [
      {
        src: "/images/gallery/photo-1454.png",
        alt: "Spécialité maison — pommes de terre épicées",
      },
      {
        src: "/images/gallery/photo-7070.png",
        alt: "Assiettes de grillades syriennes",
      },
    ],
  },
  {
    id: "grill-drinks",
    layout: "pair",
    images: [
      {
        src: "/images/gallery/photo-7069.png",
        alt: "Grillades syriennes et pain épicé",
      },
      {
        src: "/images/drinks-mint.png",
        alt: "Boissons fraîches à la menthe",
      },
    ],
  },
];

function HeroSection() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
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
                  alt=""
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
          Notre maison vous accueille à Quaregnon. Venez déguster nos plats
          orientaux, partager un moment autour de la table et profiter d’une
          ambiance chaleureuse, sur place ou à emporter.
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
    </section>
  );
}

export default HeroSection;
