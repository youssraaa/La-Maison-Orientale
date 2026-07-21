import { Link } from "react-router-dom";
import { homePreviewImages } from "../data/galleryData";

function HomeGalleryPreview() {
  return (
    <section className="home-gallery-preview editorial--alt">
      <div className="home-gallery-preview__inner">
        <div className="home-gallery-preview__header">
          <p className="editorial__label">L&apos;expérience</p>
          <h2 className="editorial__title">Nos créations en images</h2>
        </div>

        <div className="gallery__grid gallery__grid--compact">
          {homePreviewImages.map((image) => (
            <figure key={image.src} className="gallery__cell">
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
