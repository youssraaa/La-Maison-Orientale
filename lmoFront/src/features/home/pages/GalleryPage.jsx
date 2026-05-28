import PublicNavbar from "../../../common/components/PublicNavbar";

function GalleryPage() {
  return (
    <main className="page">
      <PublicNavbar />
      <section className="page__hero">
        <h1>Galerie</h1>
        <p>L&apos;atmosphère de La Maison Orientale en images.</p>
      </section>

      <section className="section-card gallery">
        <div className="gallery__grid">
          <img src="/images/storefront.png" alt="Façade du restaurant" />
          <img src="/images/interior-team.png" alt="Intérieur du restaurant" />
          <img src="/images/logo-wall.png" alt="Logo mural" />
        </div>
      </section>
    </main>
  );
}

export default GalleryPage;
