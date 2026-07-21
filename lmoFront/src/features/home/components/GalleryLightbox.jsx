import { useEffect } from "react";

function GalleryLightbox({ images, index, onClose, onPrev, onNext }) {
  const image = images[index];

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, onPrev, onNext]);

  if (!image) return null;

  return (
    <div
      className="gallery-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Aperçu de la photo"
      onClick={onClose}
    >
      <button
        type="button"
        className="gallery-lightbox__close"
        aria-label="Fermer"
        onClick={onClose}
      >
        ×
      </button>

      <button
        type="button"
        className="gallery-lightbox__arrow gallery-lightbox__arrow--prev"
        aria-label="Photo précédente"
        onClick={(event) => {
          event.stopPropagation();
          onPrev();
        }}
      >
        ‹
      </button>

      <figure
        className="gallery-lightbox__figure"
        onClick={(event) => event.stopPropagation()}
      >
        <img src={image.src} alt={image.alt} />
        <figcaption aria-hidden="true">
          {index + 1} / {images.length}
        </figcaption>
      </figure>

      <button
        type="button"
        className="gallery-lightbox__arrow gallery-lightbox__arrow--next"
        aria-label="Photo suivante"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
      >
        ›
      </button>
    </div>
  );
}

export default GalleryLightbox;
