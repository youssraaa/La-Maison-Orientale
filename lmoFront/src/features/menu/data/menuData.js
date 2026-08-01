/**
 * Carte La Maison Orientale — alignée sur le menu papier officiel.
 * Titres de section = uniquement ceux présents sur le papier.
 * Orthographe site : Shawarma (enseigne).
 */

export const menuCategories = [
  {
    id: "entrees-froides",
    title: "Entrées froides",
    image: "/images/gallery/photo-1447.png",
    items: [
      {
        name: "Hommos",
        description: "Purée de pois chiches, huile d'olive, paprika.",
        price: 7,
      },
      {
        name: "Moutabal",
        description:
          "Purée d'aubergines, sauce tahini (à base de graines de sésame moulues, de citron et d'ail).",
        price: 7,
      },
      {
        name: "Warak enab",
        description: "Persil, oignons, citron, menthe, riz, huile d'olive.",
        price: 10,
      },
      {
        name: "Salade fattouche",
        description:
          "Tomates, radis, poivron, concombre, oignon vert, citron, menthe, mélasse de grenade, graines de grenade.",
        price: 10,
      },
      {
        name: "Taboulé",
        description: "Persil, oignons, citron, menthe, boulgour, huile d'olive.",
        price: 8,
      },
      {
        name: "Salade russe",
        price: 3.5,
      },
    ],
  },
  {
    id: "entrees-chaudes",
    title: "Entrées chaudes",
    image: "/images/gallery/photo-1454.png",
    items: [
      { name: "Soupe de lentilles", price: 7 },
      {
        name: "Kebbé frit (3 pièces)",
        description: "Boulgour moulu, viande hachée, oignons, fruits secs.",
        price: 10,
      },
      {
        name: "Fatayers aux épinards (3 pièces)",
        description:
          "Mélasse de grenade, graines de grenade, oignons, noix de cajou.",
        price: 10,
      },
      { name: "Fatayer jebnah (3 pièces)", price: 10 },
      {
        name: "Falafel",
        description:
          "Purée de pois chiches, coriandre, persil, oignons, sauce tahini (à base de graines de sésame moulues, de citron et d'ail).",
        price: 8,
      },
      {
        name: "Batata harra",
        description: "Pommes de terre sautées piquantes.",
        price: 8,
      },
      { name: "Riz", price: 6 },
      {
        name: "Boulgour",
        description: "Oignons, carottes, sauce tomate.",
        price: 6,
      },
    ],
  },
  {
    id: "sandwichs-shawarmas",
    title: "Nos sandwichs & shawarmas",
    image: "/images/takeaway.png",
    items: [
      { name: "Durum shawarma", price: 8.5 },
      { name: "Durum shawarma plus frites", price: 12 },
      { name: "Durum pané au shawarma", price: 12 },
      { name: "Durum falafel", price: 7 },
      { name: "Durum kefta", price: 10.5 },
      { name: "Durum brochettes de bœuf", price: 10 },
      { name: "Durum brochettes d'agneau", price: 11 },
      { name: "Durum brochettes de poulet", price: 9.5 },
      { name: "Sandwich shawarma", price: 9.5 },
      {
        name: "Plat shawarma",
        description:
          "Garniture : salade verte, salade russe, frites, sauce maison.",
        price: 21,
      },
      {
        name: "Plat shawarma arabi",
        description:
          "Garniture : salade verte, salade russe, frites, sauce maison.",
        price: 20,
      },
      {
        name: "Shawarma extra",
        description:
          "Garniture : salade verte, salade russe, frites, sauce maison.",
        price: 25,
      },
      {
        name: "Plat falafel arabi",
        description: "Garniture : salade verte, cornichons, hommos.",
        price: 15,
      },
      { name: "Sandwich brochettes de poulet", price: 10 },
      { name: "Sandwich brochettes de bœuf", price: 10.5 },
      { name: "Sandwich brochettes d'agneau", price: 11.5 },
      { name: "Sandwich kefta", price: 11 },
      { name: "Hamburger bœuf", price: 8 },
      { name: "Hamburger poulet croustillant", price: 8 },
      { name: "Filet de poulet croustillant (3 pièces)", price: 9 },
      { name: "Frites petite portion", price: 3 },
      { name: "Frites grande portion", price: 6 },
    ],
  },
  {
    id: "sauces",
    title: "Sauces",
    image: "/images/gallery/photo-2624.png",
    note: "1,00 € l'unité.",
    items: [
      { name: "Ail", price: 1 },
      { name: "Ketchup", price: 1 },
      { name: "Mayonnaise", price: 1 },
      { name: "Samouraï", price: 1 },
      { name: "Algérienne", price: 1 },
      { name: "Andalouse", price: 1 },
      { name: "Barbecue", price: 1 },
      { name: "Américaine", price: 1 },
      { name: "Tartare", price: 1 },
      { name: "Brésilienne", price: 1 },
      { name: "Ketchup curry", price: 1 },
      { name: "Harissa", price: 1 },
    ],
  },
  {
    id: "plats",
    title: "Nos plats",
    image: "/images/gallery/photo-7070.png",
    items: [
      {
        name: "Côtelettes d'agneau (4 pièces)",
        description: "Garniture : salade, boulgour, hommos, moutabal.",
        price: 28,
      },
      {
        name: "Kefta avec aubergines grillées",
        description: "Garniture : salade, boulgour, hommos, moutabal.",
        price: 23.5,
      },
      {
        name: "Brochettes d'agneau",
        description: "Garniture : salade, boulgour, hommos, moutabal.",
        price: 24,
      },
      {
        name: "Brochettes de bœuf",
        description: "Garniture : salade, boulgour, hommos, moutabal.",
        price: 22.5,
      },
      {
        name: "Brochettes de kefta",
        description: "Garniture : salade, boulgour, hommos, moutabal.",
        price: 22,
      },
      {
        name: "Brochettes de poulet",
        description: "Garniture : salade, boulgour, hommos, moutabal.",
        price: 20,
      },
      {
        name: "Ailes de poulet (5 pièces)",
        description: "Garniture : salade, boulgour, hommos, moutabal.",
        price: 19,
      },
      {
        name: "Pilons de poulet",
        description: "Garniture : salade, boulgour, hommos, moutabal.",
        price: 21,
      },
      {
        name: "Brochettes mixte (1 personne)",
        description:
          "Garniture : salade, boulgour, hommos, moutabal, 5 brochettes mixtes.",
        price: 31,
      },
      {
        name: "1 kg grillade mixte (2 personnes)",
        description:
          "Garniture : légumes grillés à l'orientale, sauce maison, 10 brochettes mixtes.",
        price: 55,
      },
      {
        name: "Grand plateau de grillades mixtes pour 4 personnes, servis avec un assortiment de mezzés maison",
        description:
          "Fattouches, boulgour, hommos, moutabal, frites, mhammara, sauce maison, 16 brochettes mixtes, légumes grillés à l'orientale.",
        price: 110,
        featured: true,
      },
    ],
  },
  {
    id: "boissons-chaudes",
    title: "Nos boissons chaudes",
    image: "/images/gallery/photo-1322.png",
    subsections: [
      {
        title: "Café",
        items: [
          { name: "Espresso", price: 2.5 },
          { name: "Double expresso", price: 3.5 },
          { name: "Café syrien", price: 4 },
          { name: "Café", price: 3 },
          { name: "Cappuccino", price: 3.5 },
        ],
      },
      {
        title: "Thé",
        items: [
          { name: "Thé à la menthe", price: 4 },
          { name: "Thé noir", price: 3 },
        ],
      },
    ],
  },
  {
    id: "soft",
    title: "Nos soft",
    image: "/images/drinks-mint.png",
    subsections: [
      {
        title: "Eau",
        items: [
          { name: "Eau plate 1/4 L", price: 2.5 },
          { name: "Eau pétillante 1/4 L", price: 2.5 },
          { name: "Eau plate 1/2 L", price: 4 },
          { name: "Eau pétillante 1/2 L", price: 4 },
          { name: "Eau plate 1 L", price: 7.9 },
          { name: "Eau pétillante 1 L", price: 7.9 },
        ],
      },
      {
        title: "Canette",
        items: [
          { name: "Coca / Coca zéro", price: 2 },
          { name: "Fanta orange / citron", price: 2 },
          { name: "Sprite", price: 2 },
          { name: "Ice tea pêche / pétillant", price: 2 },
          { name: "Tropical Oasis", price: 2 },
          { name: "Schweppes agrumes", price: 2 },
          { name: "Red Bull", price: 2 },
          { name: "Uludağ gazoz", price: 2 },
          { name: "Ayran", price: 2 },
        ],
      },
      {
        title: "Bouteilles",
        items: [
          { name: "Coca / Coca zéro", price: 3 },
          { name: "Fanta orange", price: 3 },
          { name: "Sprite", price: 3 },
          { name: "Ice tea pêche", price: 3 },
          { name: "Ice tea pétillant", price: 3 },
          { name: "Looza", price: 3 },
        ],
      },
    ],
  },
];

export function formatPrice(price) {
  if (price == null) return null;
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}
