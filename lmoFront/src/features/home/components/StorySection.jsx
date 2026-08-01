import { Link } from "react-router-dom";

function StorySection() {
  return (
    <section className="story-section" id="notre-maison">
      <div className="story-section__inner">
        <div className="story-section__text">
          <p className="section-kicker">Notre histoire</p>
          <h2>
            Deux frères d’Alep,{" "}
            <span className="story-section__title-keep">
              une maison à&nbsp;Quaregnon
            </span>
          </h2>
          <p>
            La Maison Orientale, c’est l’histoire de deux frères syriens
            originaires d’Alep, <strong>Salah Karayem</strong> et{" "}
            <strong>Zakaria Karayem</strong>. À Quaregnon, en Belgique, ils ont
            ouvert leur maison pour partager ce qu’ils aiment le plus : la
            cuisine orientale syrienne, le goût du charbon et le plaisir de bien
            recevoir.
          </p>
          <p>
            Autour de la table, on partage comme en famille : mezzés généreux,
            shawarma et grillades au charbon, une déco qui sent l’Orient et une
            ambiance où l’on se sent immédiatement chez soi. Chaque plat raconte
            un geste transmis : le tahini du moutabal, la mélasse de grenade de
            la fattouche, le fumet des brochettes. Une cuisine orientale
            syrienne vraie, pour le midi comme pour le soir : sur place, à
            emporter ou en livraison.
          </p>
          <p className="story-section__quote">
            «&nbsp;On partage l’Orient comme à la maison.&nbsp;»
          </p>
          <Link to="/menu" className="text-link">
            Découvrir la carte →
          </Link>
        </div>

        <div className="story-section__media">
          <div className="story-section__frame">
            <img
              src="/images/interior-team.png"
              alt="L’équipe de La Maison Orientale"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default StorySection;
