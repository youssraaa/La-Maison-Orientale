import PublicNavbar from "../../../common/components/PublicNavbar";
import { galleryImages } from "../data/galleryData";

function GalleryPage() {
  return (
    <main className="page">
      <PublicNavbar />
      <section className="page__hero">
        <h1>Galerie</h1>
        <p>L&apos;atmosphère et nos créations — La Maison Orientale en images.</p>
      </section>

      <section className="section-card gallery">
        <div className="gallery__grid">
          {galleryImages.map((image) => (
            <figure key={image.src} className="gallery__cell">
              <img src={image.src} alt={image.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      </section>
    </main>
  );
}

export default GalleryPage;
