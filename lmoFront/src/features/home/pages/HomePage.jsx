import { Link } from "react-router-dom";
import PublicNavbar from "../../../common/components/PublicNavbar";
import HeroSection from "../components/HeroSection";
import EditorialSection from "../components/EditorialSection";
import HomeGalleryPreview from "../components/HomeGalleryPreview";

function HomePage() {
  return (
    <main className="home-page">
      <PublicNavbar />
      <HeroSection />

      <EditorialSection
        label="Notre maison"
        title="L'histoire de La Maison Orientale"
        paragraphs={[
          "Née d'une passion pour la cuisine syrienne, La Maison Orientale invite à découvrir les saveurs du Levant dans un cadre chaleureux et raffiné, au cœur de Quaregnon.",
          "De génération en génération, les recettes ont voyagé : épices parfumées, mijotages patients, grillades au charbon de bois et douceurs orientales qui racontent les fêtes de famille et les tables partagées.",
          "Notre engagement : une cuisine faite maison, des produits choisis avec soin, et un accueil qui place l'humain au centre de l'expérience.",
        ]}
        imageSrc="/images/interior-team.png"
        imageAlt="Équipe et ambiance La Maison Orientale"
      />

      <HomeGalleryPreview />

      <EditorialSection
        label="Saveurs du Levant"
        title="Une cuisine syrienne authentique"
        paragraphs={[
          "Entre Damas, Alep et les routes des épices, la cuisine syrienne est une cuisine de partage : mezzés généreux, grillades parfumées, plats mijotés longuement et pâtisseries délicates.",
          "Chaque assiette exprime un savoir-faire transmis avec respect — une invitation à voyager par les sens, sans quitter la table.",
        ]}
        imageSrc="/images/logo-wall.png"
        imageAlt="Identité visuelle La Maison Orientale"
        reverse
        alt
      />

      <EditorialSection
        label="La carte"
        title="Découvrir nos créations"
        paragraphs={[
          "Mezzés, grillades, spécialités maison et desserts orientaux : notre carte célèbre les classiques syriens et les recettes de la maison, pour un voyage gustatif complet.",
        ]}
        linkTo="/menu"
        linkLabel="→ Voir la carte"
        imageSrc="/images/storefront.png"
        imageAlt="La Maison Orientale"
      />

      <EditorialSection
        label="Réservation"
        title="Réserver votre table"
        paragraphs={[
          "Réservez en ligne en quelques clics : choisissez votre date, votre créneau et confirmez votre venue. Nous avons hâte de vous accueillir.",
        ]}
        linkTo="/reservation"
        linkLabel="→ Réserver une table"
        imageSrc="/images/logo-round.png"
        imageAlt="La Maison Orientale"
        reverse
        alt
      />

      <footer className="site-footer">
        <div className="site-footer__inner">
          <p className="site-footer__brand">La Maison Orientale</p>
          <p>Quaregnon — Cuisine syrienne</p>
          <Link to="/contact" className="site-footer__link">
            Contact & horaires
          </Link>
        </div>
      </footer>
    </main>
  );
}

export default HomePage;
