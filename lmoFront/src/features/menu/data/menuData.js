/**
 * Carte La Maison Orientale — données issues du menu officiel.
 * Prêt pour branchement API (GET /api/public/menu) ultérieur.
 */

export const menuCategories = [
  {
    id: "entrees-froides",
    title: "Entrées froides",
    items: [
      {
        name: "Hommos",
        description:
          "Purée de pois chiches, huile d'olive, paprika.",
        price: 7.5,
      },
      {
        name: "Moutabal",
        description:
          "Purée d'aubergines, sauce tahini (graines de sésame, citron, ail).",
        price: 8,
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
        price: 9,
      },
      {
        name: "Taboulé",
        description: "Persil, oignons, citron, menthe, boulgour, huile d'olive.",
        price: 8,
      },
    ],
  },
  {
    id: "entrees-chaudes",
    title: "Entrées chaudes",
    items: [
      { name: "Soupe de lentilles", price: 7 },
      {
        name: "Kebbé frit (3 pièces)",
        description: "Boulgour moulu, viande hachée, oignons, fruits secs.",
        price: 9,
      },
      {
        name: "Fatayers aux épinards (3 pièces)",
        description:
          "Mélasse de grenade, graines de grenade, oignons, noix de cajou.",
        price: 8,
      },
      { name: "Fatayer jebnah (3 pièces)", price: 8 },
      {
        name: "Falafel",
        description:
          "Purée de pois chiches, coriandre, persil, oignons, sauce tahini.",
        price: 8,
      },
      {
        name: "Batata harra",
        description: "Pommes de terre sautées piquantes.",
        price: 7,
      },
    ],
  },
  {
    id: "accompagnements",
    title: "Accompagnements",
    items: [
      { name: "Riz", price: 6 },
      {
        name: "Boulgour",
        description: "Oignons, carottes, sauce tomate.",
        price: 6,
      },
    ],
  },
  {
    id: "sandwichs-chawarmas",
    title: "Sandwichs & chawarmas",
    items: [
      { name: "Durum chawarma", price: 7.5 },
      { name: "Durum pané au chawarma", price: 10 },
      { name: "Durum falafel", price: 6.5 },
      { name: "Durum kefta", price: 8 },
      { name: "Durum brochettes de bœuf", price: 9 },
      { name: "Durum brochettes d'agneau", price: 9 },
      { name: "Sandwich chawarma", price: 9 },
      { name: "Sandwich kefta", price: 9 },
      { name: "Sandwich brochettes d'agneau", price: 9 },
      { name: "Sandwich brochettes de bœuf", price: 9 },
    ],
  },
  {
    id: "plats",
    title: "Plats",
    items: [
      {
        name: "Plat chawarma arabi",
        description:
          "Garniture : salade verte, salade russe, cornichons, frites, sauce.",
        price: 14,
      },
      {
        name: "Assiette chawarma",
        description:
          "Garniture : salade verte, salade russe, cornichons, riz, frites, sauce.",
        price: 16,
      },
      { name: "Hamburger bœuf", price: 8 },
      { name: "Hamburger poulet croustillant", price: 7 },
      { name: "Filet de poulet croustillant (3 pièces)", price: 9 },
      { name: "Frites — petite portion", price: 3 },
      { name: "Frites — grande portion", price: 6 },
    ],
  },
  {
    id: "sauces",
    title: "Sauces",
    note: "Disponibles sur demande.",
    items: [
      { name: "Ail", price: null },
      { name: "Ketchup", price: null },
      { name: "Mayonnaise", price: null },
      { name: "Samouraï", price: null },
      { name: "Algérienne", price: null },
      { name: "Andalouse", price: null },
      { name: "Barbecue", price: null },
      { name: "Américaine", price: null },
      { name: "Tartare", price: null },
      { name: "Brésilienne", price: null },
      { name: "Ketchup curry", price: null },
      { name: "Harissa", price: null },
    ],
  },
  {
    id: "boissons-chaudes",
    title: "Boissons chaudes",
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
    title: "Soft",
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
          { name: "Coca / Coca zéro", price: 2.5 },
          { name: "Fanta orange", price: 2.5 },
          { name: "Sprite", price: 2.5 },
          { name: "Ice tea pêche", price: 2.5 },
          { name: "Ice tea pétillant", price: 2.5 },
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
