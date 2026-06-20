import { Link } from "react-router-dom";
import { homePreviewImages } from "../data/galleryData";

function HomeGalleryPreview() {
  return (
    <section className="home-gallery-preview editorial--alt">
      <div className="home-gallery-preview__inner">
        <div className="home-gallery-preview__header">
          <p className="editorial__label">L&apos;expérience</p>
          <h2 className="editorial__title">Nos créations en images</h2>
          <p className="editorial__text">
            Grillades, mezzés et spécialités maison — un aperçu de ce qui vous
            attend à table.
          </p>
        </div>

        <div className="gallery__grid gallery__grid--compact">
          {homePreviewImages.map((image) => (
            <figure key={image.src} className="gallery__cell">
              <img src={image.src} alt={image.alt} loading="lazy" />
            </figure>
          ))}
        </div>

        <Link to="/galerie" className="editorial__link home-gallery-preview__link">
          → Voir la galerie complète
        </Link>
      </div>
    </section>
  );
}

export default HomeGalleryPreview;
