import { useState } from "react";
import PublicNavbar from "../../../common/components/PublicNavbar";
import SiteFooter from "../../../common/components/SiteFooter";
import { galleryImages } from "../data/galleryData";
import GalleryLightbox from "../components/GalleryLightbox";

function GalleryPage() {
  const [activeIndex, setActiveIndex] = useState(null);
  const isOpen = activeIndex !== null;

  const close = () => setActiveIndex(null);
  const goPrev = () =>
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + galleryImages.length) % galleryImages.length,
    );
  const goNext = () =>
    setActiveIndex((i) =>
      i === null ? null : (i + 1) % galleryImages.length,
    );

  return (
    <main className="page gallery-page">
      <PublicNavbar />
      <section className="page__hero page__hero--gallery">
        <p className="page__hero-kicker">En images</p>
        <h1>Galerie</h1>
        <p>
          Nos plats, notre terrasse et l&apos;ambiance de La Maison Orientale,
          capturés pour vous.
        </p>
      </section>

      <section className="gallery-page__body">
        <div className="gallery__grid gallery__grid--page">
          {galleryImages.map((image, index) => (
            <button
              key={image.src}
              type="button"
              className="gallery__cell gallery__cell--button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Voir ${image.alt}`}
            >
              <img src={image.src} alt={image.alt} loading="lazy" />
            </button>
          ))}
        </div>
      </section>

      {isOpen && (
        <GalleryLightbox
          images={galleryImages}
          index={activeIndex}
          onClose={close}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}

      <SiteFooter />
    </main>
  );
}

export default GalleryPage;
