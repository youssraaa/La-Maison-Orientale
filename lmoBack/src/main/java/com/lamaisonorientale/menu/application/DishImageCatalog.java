package com.lamaisonorientale.menu.application;

import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * Chemins d'images plats servis au frontend (/images/dishes/…).
 * Aligné sur lmoFront/src/features/order/utils/dishImages.js
 */
public final class DishImageCatalog {

    private static final String BASE = "/images/dishes";
    private static final Map<String, String> BY_NAME = buildMap();
    private static final Pattern WS = Pattern.compile("\\s+");

    private DishImageCatalog() {}

    public static String resolve(String platNom) {
        String key = normalize(platNom);
        if (key.isEmpty()) {
            return null;
        }
        String exact = BY_NAME.get(key);
        if (exact != null) {
            return exact;
        }
        String lower = key.toLowerCase(Locale.ROOT);
        for (Map.Entry<String, String> entry : BY_NAME.entrySet()) {
            if (entry.getKey().toLowerCase(Locale.ROOT).equals(lower)) {
                return entry.getValue();
            }
        }
        return matchKeyword(key);
    }

    private static String matchKeyword(String name) {
        String lower = name.toLowerCase(Locale.ROOT);
        if (lower.contains("hommos") || lower.contains("hummus")) return path("hommos.jpg");
        if (lower.contains("moutabal")) return path("moutabal.jpg");
        if (lower.contains("fattouche")) return path("salade-fattouche.jpg");
        if (lower.contains("taboul")) return path("taboule.jpg");
        if (lower.contains("salade russe")) return path("salade-russe.jpg");
        if (lower.contains("lentille")) return path("soupe-lentilles.jpg");
        if (lower.contains("kebb")) return path("kebbe.jpg");
        if (lower.contains("falafel")) return path("falafel.jpg");
        if (lower.contains("warak") || lower.contains("dolma")) return path("warak-enab.jpg");
        if (lower.contains("coca")) return path("coca.jpg");
        if (lower.contains("fanta")) return path("fanta.jpg");
        if (lower.contains("sprite")) return path("sprite.jpg");
        if (lower.contains("schweppes")) return path("schweppes.jpg");
        if (lower.contains("red bull")) return path("red-bull.jpg");
        if (lower.contains("eau p") && lower.contains("till")) return path("eau-petillante.jpg");
        if (lower.contains("eau")) return path("eau-plate.jpg");
        if (lower.contains("ketchup") && lower.contains("curry")) return path("sauce-curry.jpg");
        if (lower.contains("ketchup")) return path("sauce-ketchup.jpg");
        if (lower.contains("mayonnaise") || lower.equals("mayo")) return path("sauce-mayo.jpg");
        if (lower.contains("harissa")) return path("sauce-harissa.jpg");
        if (lower.contains("samoura")) return path("sauce-samourai.jpg");
        if (lower.contains("alg") && lower.contains("rienne")) return path("sauce-algerienne.jpg");
        if (lower.contains("andalouse")) return path("sauce-andalouse.jpg");
        if (lower.contains("barbecue")) return path("sauce-barbecue.jpg");
        if (lower.contains("am") && lower.contains("ricaine")) return path("sauce-americaine.jpg");
        if (lower.contains("tartare")) return path("sauce-tartare.jpg");
        if (lower.contains("br") && lower.contains("silienne")) return path("sauce-bresilienne.jpg");
        if (lower.equals("ail")) return path("sauce-ail.jpg");
        if (lower.contains("brochettes") && lower.contains("poulet")) return path("brochettes-poulet.jpg");
        if (lower.contains("brochettes") && lower.contains("b") && lower.contains("uf"))
            return path("brochettes-boeuf.png");
        if (lower.contains("brochettes") && lower.contains("agneau")) return path("brochettes-agneau.jpg");
        if (lower.contains("brochettes") && lower.contains("kefta")) return path("brochettes-kefta.jpg");
        if (lower.contains("shawarma")) return path("durum-shawarma.jpg");
        if (lower.contains("frites")) return path("frites.jpg");
        return null;
    }

    private static String path(String file) {
        return BASE + "/" + file;
    }

    private static String normalize(String value) {
        if (value == null) {
            return "";
        }
        return WS.matcher(
                        Normalizer.normalize(value, Normalizer.Form.NFC)
                                .replace('\u2019', '\'')
                                .replace('\u2018', '\'')
                                .trim())
                .replaceAll(" ")
                .replace("Œ", "Oe")
                .replace("œ", "oe");
    }

    private static Map<String, String> buildMap() {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("Hommos", path("hommos.jpg"));
        map.put("Moutabal", path("moutabal.jpg"));
        map.put("Warak enab", path("warak-enab.jpg"));
        map.put("Salade fattouche", path("salade-fattouche.jpg"));
        map.put("Taboulé", path("taboule.jpg"));
        map.put("Salade russe", path("salade-russe.jpg"));
        map.put("Soupe de lentilles", path("soupe-lentilles.jpg"));
        map.put("Kebbé frit (3 pièces)", path("kebbe.jpg"));
        map.put("Fatayers aux épinards (3 pièces)", path("fatayer-epinards.jpg"));
        map.put("Fatayer jebnah (3 pièces)", path("fatayer-fromage.jpg"));
        map.put("Falafel", path("falafel.jpg"));
        map.put("Batata harra", path("batata-harra.jpg"));
        map.put("Riz", path("riz.jpg"));
        map.put("Boulgour", path("boulgour.jpg"));
        map.put("Durum shawarma", path("durum-shawarma.jpg"));
        map.put("Durum shawarma plus frites", path("durum-shawarma-frites.jpg"));
        map.put("Durum pané au shawarma", path("durum-pane.jpg"));
        map.put("Durum falafel", path("durum-falafel.jpg"));
        map.put("Durum kefta", path("durum-kefta.jpg"));
        map.put("Durum brochettes de bœuf", path("durum-brochette-boeuf.jpg"));
        map.put("Durum brochettes d'agneau", path("durum-brochette-agneau.jpg"));
        map.put("Durum brochettes de poulet", path("durum-brochette-poulet.jpg"));
        map.put("Sandwich shawarma", path("sandwich-shawarma.jpg"));
        map.put("Plat shawarma", path("plat-shawarma.png"));
        map.put("Plat shawarma arabi", path("plat-shawarma-arabi.png"));
        map.put("Shawarma extra", path("shawarma-extra.png"));
        map.put("Plat falafel arabi", path("plat-falafel-arabi.png"));
        map.put("Sandwich brochettes de poulet", path("sandwich-brochette-poulet.jpg"));
        map.put("Sandwich brochettes de bœuf", path("sandwich-brochette-boeuf.jpg"));
        map.put("Sandwich brochettes d'agneau", path("sandwich-brochette-agneau.jpg"));
        map.put("Sandwich kefta", path("sandwich-kefta.jpg"));
        map.put("Hamburger bœuf", path("hamburger-boeuf.jpg"));
        map.put("Hamburger poulet croustillant", path("hamburger-poulet.jpg"));
        map.put("Filet de poulet croustillant (3 pièces)", path("filet-poulet.jpg"));
        map.put("Frites petite portion", path("frites.jpg"));
        map.put("Frites grande portion", path("frites.jpg"));
        map.put("Ail", path("sauce-ail.jpg"));
        map.put("Ketchup", path("sauce-ketchup.jpg"));
        map.put("Mayonnaise", path("sauce-mayo.jpg"));
        map.put("Samouraï", path("sauce-samourai.jpg"));
        map.put("Algérienne", path("sauce-algerienne.jpg"));
        map.put("Andalouse", path("sauce-andalouse.jpg"));
        map.put("Barbecue", path("sauce-barbecue.jpg"));
        map.put("Américaine", path("sauce-americaine.jpg"));
        map.put("Tartare", path("sauce-tartare.jpg"));
        map.put("Brésilienne", path("sauce-bresilienne.jpg"));
        map.put("Ketchup curry", path("sauce-curry.jpg"));
        map.put("Harissa", path("sauce-harissa.jpg"));
        map.put("Côtelettes d'agneau (4 pièces)", path("cotelettes-agneau.png"));
        map.put("Kefta avec aubergines grillées", path("kefta-aubergines.png"));
        map.put("Brochettes d'agneau", path("brochettes-agneau.jpg"));
        map.put("Brochettes de bœuf", path("brochettes-boeuf.png"));
        map.put("Brochettes de kefta", path("brochettes-kefta.jpg"));
        map.put("Brochettes de poulet", path("brochettes-poulet.jpg"));
        map.put("Ailes de poulet (5 pièces)", path("ailes-poulet.jpg"));
        map.put("Pilons de poulet", path("pilons-poulet.jpg"));
        map.put("Brochettes mixte (1 personne)", path("brochettes-mixte.png"));
        map.put("1 kg grillade mixte (2 personnes)", path("grillade-1kg.png"));
        map.put(
                "Grand plateau de grillades mixtes pour 4 personnes, servis avec un assortiment de mezzés maison",
                path("grand-plateau.png"));
        map.put("Espresso", path("espresso.jpg"));
        map.put("Double expresso", path("double-expresso.jpg"));
        map.put("Café syrien", path("cafe-syrien.jpg"));
        map.put("Café", path("cafe.jpg"));
        map.put("Cappuccino", path("cappuccino.jpg"));
        map.put("Thé à la menthe", path("the-menthe.jpg"));
        map.put("Thé noir", path("the-noir.jpg"));
        map.put("Eau plate 1/4 L", path("eau-plate.jpg"));
        map.put("Eau pétillante 1/4 L", path("eau-petillante.jpg"));
        map.put("Eau plate 1/2 L", path("eau-plate.jpg"));
        map.put("Eau pétillante 1/2 L", path("eau-petillante.jpg"));
        map.put("Eau plate 1 L", path("eau-plate.jpg"));
        map.put("Eau pétillante 1 L", path("eau-petillante.jpg"));
        map.put("Coca / Coca zéro", path("coca.jpg"));
        map.put("Fanta orange / citron", path("fanta.jpg"));
        map.put("Sprite", path("sprite.jpg"));
        map.put("Ice tea pêche / pétillant", path("ice-tea.jpg"));
        map.put("Tropical Oasis", path("tropical.jpg"));
        map.put("Schweppes agrumes", path("schweppes.jpg"));
        map.put("Red Bull", path("red-bull.jpg"));
        map.put("Uludağ gazoz", path("uludag.jpg"));
        map.put("Ayran", path("ayran.jpg"));
        map.put("Fanta orange", path("fanta.jpg"));
        map.put("Ice tea pêche", path("ice-tea.jpg"));
        map.put("Ice tea pétillant", path("ice-tea.jpg"));
        map.put("Looza", path("looza.jpg"));
        return Map.copyOf(map);
    }
}
