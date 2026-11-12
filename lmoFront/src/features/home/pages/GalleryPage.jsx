import { useEffect, useState } from "react";
import PublicNavbar from "../../../common/components/PublicNavbar";
import SiteFooter from "../../../common/components/SiteFooter";
import { fetchPublicGalerie } from "../../admin/api/publicContentApi";
import { galleryImages as fallbackImages } from "../data/galleryData";
import GalleryLightbox from "../components/GalleryLightbox";

function GalleryPage() {
  const [images, setImages] = useState(fallbackImages);
  const [activeIndex, setActiveIndex] = useState(null);
  const isOpen = activeIndex !== null;

  useEffect(() => {
    let cancelled = false;
    fetchPublicGalerie(false)
      .then((list) => {
        if (!cancelled && list.length > 0) {
          setImages(list);
        }
      })
      .catch(() => {
        /* fallback local */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const close = () => setActiveIndex(null);
  const goPrev = () =>
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + images.length) % images.length,
    );
  const goNext = () =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % images.length));

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
          {images.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              className="gallery__cell gallery__cell--button"
              onClick={() => setActiveIndex(index)}
            >
              <img src={image.src} alt={image.alt || ""} loading="lazy" />
            </button>
          ))}
        </div>
      </section>

      {isOpen ? (
        <GalleryLightbox
          images={images}
          index={activeIndex}
          onClose={close}
          onPrev={goPrev}
          onNext={goNext}
        />
      ) : null}

      <SiteFooter />
    </main>
  );
}

export default GalleryPage;
