import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPublicGalerie } from "../../admin/api/publicContentApi";
import { homePreviewImages as fallbackImages } from "../data/galleryData";

function HomeGalleryPreview() {
  const [images, setImages] = useState(fallbackImages);

  useEffect(() => {
    let cancelled = false;
    fetchPublicGalerie(true)
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

  return (
    <section className="home-gallery-preview editorial--alt">
      <div className="home-gallery-preview__inner">
        <div className="home-gallery-preview__header">
          <p className="editorial__label">L&apos;expérience</p>
          <h2 className="editorial__title">Nos créations en images</h2>
        </div>

        <div className="gallery__grid gallery__grid--compact">
          {images.map((image, index) => (
            <figure key={`${image.src}-${index}`} className="gallery__cell">
              <img src={image.src} alt={image.alt} loading="lazy" />
            </figure>
          ))}
        </div>

        <div className="home-gallery-preview__cta">
          <Link to="/galerie" className="btn btn--accent">
            Voir la galerie complète
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HomeGalleryPreview;
