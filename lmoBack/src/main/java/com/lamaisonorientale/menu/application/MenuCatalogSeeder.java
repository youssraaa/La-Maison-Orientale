package com.lamaisonorientale.menu.application;

import java.math.BigDecimal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.lamaisonorientale.menu.domain.Categorie;
import com.lamaisonorientale.menu.domain.Plat;
import com.lamaisonorientale.menu.infrastructure.CategorieRepository;
import com.lamaisonorientale.menu.infrastructure.PlatRepository;

/**
 * Seed initial de la carte (aligné sur menuData.js) si la table categorie est vide.
 */
@Component
@Order(20)
public class MenuCatalogSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(MenuCatalogSeeder.class);

    private final CategorieRepository categorieRepository;
    private final PlatRepository platRepository;

    public MenuCatalogSeeder(CategorieRepository categorieRepository, PlatRepository platRepository) {
        this.categorieRepository = categorieRepository;
        this.platRepository = platRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (categorieRepository.count() > 0) {
            return;
        }

        int ordre = 0;
        seed(
                cat("entrees-froides", "Entrées froides", "/images/gallery/photo-1447.png", null, ordre++),
                List.of(
                        item("Hommos", "Purée de pois chiches, huile d'olive, paprika.", "7"),
                        item(
                                "Moutabal",
                                "Purée d'aubergines, sauce tahini (à base de graines de sésame moulues, de citron et d'ail).",
                                "7"),
                        item("Warak enab", "Persil, oignons, citron, menthe, riz, huile d'olive.", "10"),
                        item(
                                "Salade fattouche",
                                "Tomates, radis, poivron, concombre, oignon vert, citron, menthe, mélasse de grenade, graines de grenade.",
                                "10"),
                        item("Taboulé", "Persil, oignons, citron, menthe, boulgour, huile d'olive.", "8"),
                        item("Salade russe", null, "3.5")));

        seed(
                cat("entrees-chaudes", "Entrées chaudes", "/images/gallery/photo-1454.png", null, ordre++),
                List.of(
                        item("Soupe de lentilles", null, "7"),
                        item(
                                "Kebbé frit (3 pièces)",
                                "Boulgour moulu, viande hachée, oignons, fruits secs.",
                                "10"),
                        item(
                                "Fatayers aux épinards (3 pièces)",
                                "Mélasse de grenade, graines de grenade, oignons, noix de cajou.",
                                "10"),
                        item("Fatayer jebnah (3 pièces)", null, "10"),
                        item(
                                "Falafel",
                                "Purée de pois chiches, coriandre, persil, oignons, sauce tahini (à base de graines de sésame moulues, de citron et d'ail).",
                                "8"),
                        item("Batata harra", "Pommes de terre sautées piquantes.", "8"),
                        item("Riz", null, "6"),
                        item("Boulgour", "Oignons, carottes, sauce tomate.", "6")));

        seed(
                cat(
                        "sandwichs-shawarmas",
                        "Nos sandwichs & shawarmas",
                        "/images/takeaway.png",
                        null,
                        ordre++),
                List.of(
                        item("Durum shawarma", null, "8.5"),
                        item("Durum shawarma plus frites", null, "12"),
                        item("Durum pané au shawarma", null, "12"),
                        item("Durum falafel", null, "7"),
                        item("Durum kefta", null, "10.5"),
                        item("Durum brochettes de bœuf", null, "10"),
                        item("Durum brochettes d'agneau", null, "11"),
                        item("Durum brochettes de poulet", null, "9.5"),
                        item("Sandwich shawarma", null, "9.5"),
                        item(
                                "Plat shawarma",
                                "Garniture : salade verte, salade russe, frites, sauce maison.",
                                "21"),
                        item(
                                "Plat shawarma arabi",
                                "Garniture : salade verte, salade russe, frites, sauce maison.",
                                "20"),
                        item(
                                "Shawarma extra",
                                "Garniture : salade verte, salade russe, frites, sauce maison.",
                                "25"),
                        item("Plat falafel arabi", "Garniture : salade verte, cornichons, hommos.", "15"),
                        item("Sandwich brochettes de poulet", null, "10"),
                        item("Sandwich brochettes de bœuf", null, "10.5"),
                        item("Sandwich brochettes d'agneau", null, "11.5"),
                        item("Sandwich kefta", null, "11"),
                        item("Hamburger bœuf", null, "8"),
                        item("Hamburger poulet croustillant", null, "8"),
                        item("Filet de poulet croustillant (3 pièces)", null, "9"),
                        item("Frites petite portion", null, "3"),
                        item("Frites grande portion", null, "6")));

        seed(
                cat("sauces", "Sauces", "/images/gallery/photo-2624.png", "1,00 € l'unité.", ordre++),
                List.of(
                        item("Ail", null, "1"),
                        item("Ketchup", null, "1"),
                        item("Mayonnaise", null, "1"),
                        item("Samouraï", null, "1"),
                        item("Algérienne", null, "1"),
                        item("Andalouse", null, "1"),
                        item("Barbecue", null, "1"),
                        item("Américaine", null, "1"),
                        item("Tartare", null, "1"),
                        item("Brésilienne", null, "1"),
                        item("Ketchup curry", null, "1"),
                        item("Harissa", null, "1")));

        seed(
                cat("plats", "Nos plats", "/images/gallery/photo-7070.png", null, ordre++),
                List.of(
                        item(
                                "Côtelettes d'agneau (4 pièces)",
                                "Garniture : salade, boulgour, hommos, moutabal.",
                                "28"),
                        item(
                                "Kefta avec aubergines grillées",
                                "Garniture : salade, boulgour, hommos, moutabal.",
                                "23.5"),
                        item(
                                "Brochettes d'agneau",
                                "Garniture : salade, boulgour, hommos, moutabal.",
                                "24"),
                        item(
                                "Brochettes de bœuf",
                                "Garniture : salade, boulgour, hommos, moutabal.",
                                "22.5"),
                        item(
                                "Brochettes de kefta",
                                "Garniture : salade, boulgour, hommos, moutabal.",
                                "22"),
                        item(
                                "Brochettes de poulet",
                                "Garniture : salade, boulgour, hommos, moutabal.",
                                "20"),
                        item(
                                "Ailes de poulet (5 pièces)",
                                "Garniture : salade, boulgour, hommos, moutabal.",
                                "19"),
                        item(
                                "Pilons de poulet",
                                "Garniture : salade, boulgour, hommos, moutabal.",
                                "21"),
                        item(
                                "Brochettes mixte (1 personne)",
                                "Garniture : salade, boulgour, hommos, moutabal, 5 brochettes mixtes.",
                                "31"),
                        item(
                                "1 kg grillade mixte (2 personnes)",
                                "Garniture : légumes grillés à l'orientale, sauce maison, 10 brochettes mixtes.",
                                "55"),
                        featured(
                                "Grand plateau de grillades mixtes pour 4 personnes, servis avec un assortiment de mezzés maison",
                                "Fattouches, boulgour, hommos, moutabal, frites, mhammara, sauce maison, 16 brochettes mixtes, légumes grillés à l'orientale.",
                                "110")));

        seed(
                cat(
                        "boissons-chaudes",
                        "Nos boissons chaudes",
                        "/images/gallery/photo-1322.png",
                        null,
                        ordre++),
                List.of(
                        sub("Café", "Espresso", null, "2.5"),
                        sub("Café", "Double expresso", null, "3.5"),
                        sub("Café", "Café syrien", null, "4"),
                        sub("Café", "Café", null, "3"),
                        sub("Café", "Cappuccino", null, "3.5"),
                        sub("Thé", "Thé à la menthe", null, "4"),
                        sub("Thé", "Thé noir", null, "3")));

        seed(
                cat("soft", "Nos soft", "/images/drinks-mint.png", null, ordre++),
                List.of(
                        sub("Eau", "Eau plate 1/4 L", null, "2.5"),
                        sub("Eau", "Eau pétillante 1/4 L", null, "2.5"),
                        sub("Eau", "Eau plate 1/2 L", null, "4"),
                        sub("Eau", "Eau pétillante 1/2 L", null, "4"),
                        sub("Eau", "Eau plate 1 L", null, "7.9"),
                        sub("Eau", "Eau pétillante 1 L", null, "7.9"),
                        sub("Canette", "Coca / Coca zéro", null, "2"),
                        sub("Canette", "Fanta orange / citron", null, "2"),
                        sub("Canette", "Sprite", null, "2"),
                        sub("Canette", "Ice tea pêche / pétillant", null, "2"),
                        sub("Canette", "Tropical Oasis", null, "2"),
                        sub("Canette", "Schweppes agrumes", null, "2"),
                        sub("Canette", "Red Bull", null, "2"),
                        sub("Canette", "Uludağ gazoz", null, "2"),
                        sub("Canette", "Ayran", null, "2"),
                        sub("Bouteilles", "Coca / Coca zéro", null, "3"),
                        sub("Bouteilles", "Fanta orange", null, "3"),
                        sub("Bouteilles", "Sprite", null, "3"),
                        sub("Bouteilles", "Ice tea pêche", null, "3"),
                        sub("Bouteilles", "Ice tea pétillant", null, "3"),
                        sub("Bouteilles", "Looza", null, "3")));

        log.info("Carte seedée ({} catégories).", categorieRepository.count());
    }

    private void seed(Categorie categorie, List<PlatDraft> drafts) {
        Categorie saved = categorieRepository.save(categorie);
        int i = 0;
        for (PlatDraft draft : drafts) {
            Plat plat = new Plat();
            plat.setCategorie(saved);
            plat.setNom(draft.nom());
            plat.setDescription(draft.description());
            plat.setPrix(new BigDecimal(draft.prix()));
            plat.setDisponibleEmporter(true);
            plat.setDisponibleLivraison(true);
            plat.setOrdreAffichage(i++);
            plat.setSousSection(draft.sousSection());
            plat.setFeatured(draft.featured());
            platRepository.save(plat);
        }
    }

    private static Categorie cat(String slug, String nom, String image, String note, int ordre) {
        Categorie c = new Categorie();
        c.setSlug(slug);
        c.setNom(nom);
        c.setImageUrl(image);
        c.setNote(note);
        c.setOrdreAffichage(ordre);
        c.setActive(true);
        return c;
    }

    private static PlatDraft item(String nom, String description, String prix) {
        return new PlatDraft(nom, description, prix, null, false);
    }

    private static PlatDraft featured(String nom, String description, String prix) {
        return new PlatDraft(nom, description, prix, null, true);
    }

    private static PlatDraft sub(String sous, String nom, String description, String prix) {
        return new PlatDraft(nom, description, prix, sous, false);
    }

    private record PlatDraft(
            String nom, String description, String prix, String sousSection, boolean featured) {}
}
