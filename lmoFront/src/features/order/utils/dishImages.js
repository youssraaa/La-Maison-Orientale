const BASE = "/images/dishes";

/** Une photo dédiée par plat (nom exact du menu / seed backend). */
const EXACT_IMAGES = {
  // Entrées froides
  Hommos: `${BASE}/hommos.jpg`,
  Moutabal: `${BASE}/moutabal.jpg`,
  "Warak enab": `${BASE}/warak-enab.jpg`,
  "Salade fattouche": `${BASE}/salade-fattouche.jpg`,
  Taboulé: `${BASE}/taboule.jpg`,
  "Salade russe": `${BASE}/salade-russe.jpg`,

  // Entrées chaudes
  "Soupe de lentilles": `${BASE}/soupe-lentilles.jpg`,
  "Kebbé frit (3 pièces)": `${BASE}/kebbe.jpg`,
  "Fatayers aux épinards (3 pièces)": `${BASE}/fatayer-epinards.jpg`,
  "Fatayer jebnah (3 pièces)": `${BASE}/fatayer-fromage.jpg`,
  Falafel: `${BASE}/falafel.jpg`,
  "Batata harra": `${BASE}/batata-harra.jpg`,
  Riz: `${BASE}/riz.jpg`,
  Boulgour: `${BASE}/boulgour.jpg`,

  // Sandwichs & shawarmas
  "Durum shawarma": `${BASE}/durum-shawarma.jpg`,
  "Durum shawarma plus frites": `${BASE}/durum-shawarma-frites.jpg`,
  "Durum pané au shawarma": `${BASE}/durum-pane.jpg`,
  "Durum falafel": `${BASE}/durum-falafel.jpg`,
  "Durum kefta": `${BASE}/durum-kefta.jpg`,
  "Durum brochettes de bœuf": `${BASE}/durum-brochette-boeuf.jpg`,
  "Durum brochettes d'agneau": `${BASE}/durum-brochette-agneau.jpg`,
  "Durum brochettes de poulet": `${BASE}/durum-brochette-poulet.jpg`,
  "Sandwich shawarma": `${BASE}/sandwich-shawarma.jpg`,
  "Plat shawarma": `${BASE}/plat-shawarma.png`,
  "Plat shawarma arabi": `${BASE}/plat-shawarma-arabi.png`,
  "Shawarma extra": `${BASE}/shawarma-extra.png`,
  "Plat falafel arabi": `${BASE}/plat-falafel-arabi.png`,
  "Sandwich brochettes de poulet": `${BASE}/sandwich-brochette-poulet.jpg`,
  "Sandwich brochettes de bœuf": `${BASE}/sandwich-brochette-boeuf.jpg`,
  "Sandwich brochettes d'agneau": `${BASE}/sandwich-brochette-agneau.jpg`,
  "Sandwich kefta": `${BASE}/sandwich-kefta.jpg`,
  "Hamburger bœuf": `${BASE}/hamburger-boeuf.jpg`,
  "Hamburger poulet croustillant": `${BASE}/hamburger-poulet.jpg`,
  "Filet de poulet croustillant (3 pièces)": `${BASE}/filet-poulet.jpg`,
  "Frites petite portion": `${BASE}/frites.jpg`,
  "Frites grande portion": `${BASE}/frites.jpg`,

  // Sauces — une image par sauce
  Ail: `${BASE}/sauce-ail.jpg`,
  Ketchup: `${BASE}/sauce-ketchup.jpg`,
  Mayonnaise: `${BASE}/sauce-mayo.jpg`,
  Samouraï: `${BASE}/sauce-samourai.jpg`,
  Algérienne: `${BASE}/sauce-algerienne.jpg`,
  Andalouse: `${BASE}/sauce-andalouse.jpg`,
  Barbecue: `${BASE}/sauce-barbecue.jpg`,
  Américaine: `${BASE}/sauce-americaine.jpg`,
  Tartare: `${BASE}/sauce-tartare.jpg`,
  Brésilienne: `${BASE}/sauce-bresilienne.jpg`,
  "Ketchup curry": `${BASE}/sauce-curry.jpg`,
  Harissa: `${BASE}/sauce-harissa.jpg`,

  // Plats
  "Côtelettes d'agneau (4 pièces)": `${BASE}/cotelettes-agneau.png`,
  "Kefta avec aubergines grillées": `${BASE}/kefta-aubergines.png`,
  "Brochettes d'agneau": `${BASE}/brochettes-agneau.jpg`,
  "Brochettes de bœuf": `${BASE}/brochettes-boeuf.png`,
  "Brochettes de kefta": `${BASE}/brochettes-kefta.jpg`,
  "Brochettes de poulet": `${BASE}/brochettes-poulet.jpg`,
  "Ailes de poulet (5 pièces)": `${BASE}/ailes-poulet.jpg`,
  "Pilons de poulet": `${BASE}/pilons-poulet.jpg`,
  "Brochettes mixte (1 personne)": `${BASE}/brochettes-mixte.png`,
  "1 kg grillade mixte (2 personnes)": `${BASE}/grillade-1kg.png`,
  "Grand plateau de grillades mixtes pour 4 personnes, servis avec un assortiment de mezzés maison":
    `${BASE}/grand-plateau.png`,

  // Boissons chaudes
  Espresso: `${BASE}/espresso.jpg`,
  "Double expresso": `${BASE}/double-expresso.jpg`,
  "Café syrien": `${BASE}/cafe-syrien.jpg`,
  Café: `${BASE}/cafe.jpg`,
  Cappuccino: `${BASE}/cappuccino.jpg`,
  "Thé à la menthe": `${BASE}/the-menthe.jpg`,
  "Thé noir": `${BASE}/the-noir.jpg`,

  // Soft — eaux
  "Eau plate 1/4 L": `${BASE}/eau-plate.jpg`,
  "Eau pétillante 1/4 L": `${BASE}/eau-petillante.jpg`,
  "Eau plate 1/2 L": `${BASE}/eau-plate.jpg`,
  "Eau pétillante 1/2 L": `${BASE}/eau-petillante.jpg`,
  "Eau plate 1 L": `${BASE}/eau-plate.jpg`,
  "Eau pétillante 1 L": `${BASE}/eau-petillante.jpg`,

  // Soft — canettes & bouteilles
  "Coca / Coca zéro": `${BASE}/coca.jpg`,
  "Fanta orange / citron": `${BASE}/fanta.jpg`,
  Sprite: `${BASE}/sprite.jpg`,
  "Ice tea pêche / pétillant": `${BASE}/ice-tea.jpg`,
  "Tropical Oasis": `${BASE}/tropical.jpg`,
  "Schweppes agrumes": `${BASE}/schweppes.jpg`,
  "Red Bull": `${BASE}/red-bull.jpg`,
  "Uludağ gazoz": `${BASE}/uludag.jpg`,
  Ayran: `${BASE}/ayran.jpg`,
  "Fanta orange": `${BASE}/fanta.jpg`,
  "Ice tea pêche": `${BASE}/ice-tea.jpg`,
  "Ice tea pétillant": `${BASE}/ice-tea.jpg`,
  Looza: `${BASE}/looza.jpg`,
};

function normalizeName(name) {
  return String(name || "")
    .normalize("NFC")
    .trim()
    .replace(/[\u2018\u2019\u201B`´]/g, "'")
    .replace(/œ/gi, (m) => (m === "Œ" ? "Oe" : "oe"))
    .replace(/\s+/g, " ");
}

/** Variantes d'orthographe (API, saisie admin, encodage). */
const NAME_ALIASES = {
  Taboule: "Taboulé",
  "The a la menthe": "Thé à la menthe",
  "The noir": "Thé noir",
  "Cafe syrien": "Café syrien",
  Cafe: "Café",
  "Uludag gazoz": "Uludağ gazoz",
  "Cotelettes d'agneau (4 pieces)": "Côtelettes d'agneau (4 pièces)",
  "Kebbe frit (3 pieces)": "Kebbé frit (3 pièces)",
};

const ALIAS_LOOKUP = Object.fromEntries(
  Object.entries(NAME_ALIASES).map(([alias, target]) => [normalizeName(alias), normalizeName(target)])
);

function buildExactLookup() {
  const lookup = Object.create(null);
  for (const [name, image] of Object.entries(EXACT_IMAGES)) {
    lookup[normalizeName(name)] = image;
  }
  return lookup;
}

const EXACT_LOOKUP = buildExactLookup();

/** Règles de secours — du plus spécifique au plus général. Pas de mot-clé « aubergine » seul. */
const KEYWORD_RULES = [
  { pattern: /kefta avec aubergines/i, image: `${BASE}/kefta-aubergines.png` },
  { pattern: /grand plateau|plateau de grillades/i, image: `${BASE}/grand-plateau.png` },
  { pattern: /1 kg grillade|grillade mixte \(2/i, image: `${BASE}/grillade-1kg.png` },
  { pattern: /brochettes mixte/i, image: `${BASE}/brochettes-mixte.png` },
  { pattern: /warak enab|dolma|feuille de vigne/i, image: `${BASE}/warak-enab.jpg` },
  { pattern: /hommos|hummus/i, image: `${BASE}/hommos.jpg` },
  { pattern: /^moutabal$/i, image: `${BASE}/moutabal.jpg` },
  { pattern: /fattouche/i, image: `${BASE}/salade-fattouche.jpg` },
  { pattern: /taboul/i, image: `${BASE}/taboule.jpg` },
  { pattern: /salade russe/i, image: `${BASE}/salade-russe.jpg` },
  { pattern: /soupe.*lentille|lentille/i, image: `${BASE}/soupe-lentilles.jpg` },
  { pattern: /kebb[ée]/i, image: `${BASE}/kebbe.jpg` },
  { pattern: /fatayer.*épinard|fatayer.*epinard/i, image: `${BASE}/fatayer-epinards.jpg` },
  { pattern: /fatayer|jebnah/i, image: `${BASE}/fatayer-fromage.jpg` },
  { pattern: /batata|harra/i, image: `${BASE}/batata-harra.jpg` },
  { pattern: /\briz\b/i, image: `${BASE}/riz.jpg` },
  { pattern: /boulgour/i, image: `${BASE}/boulgour.jpg` },
  { pattern: /côtelette|cottelette/i, image: `${BASE}/cotelettes-agneau.png` },
  { pattern: /plat falafel/i, image: `${BASE}/plat-falafel-arabi.png` },
  { pattern: /plat shawarma arabi/i, image: `${BASE}/plat-shawarma-arabi.png` },
  { pattern: /shawarma extra/i, image: `${BASE}/shawarma-extra.png` },
  { pattern: /plat shawarma/i, image: `${BASE}/plat-shawarma.png` },
  { pattern: /durum shawarma plus frites/i, image: `${BASE}/durum-shawarma-frites.jpg` },
  { pattern: /durum pan[ée]|durum pane/i, image: `${BASE}/durum-pane.jpg` },
  { pattern: /durum falafel/i, image: `${BASE}/durum-falafel.jpg` },
  { pattern: /durum kefta/i, image: `${BASE}/durum-kefta.jpg` },
  { pattern: /durum brochettes d'agneau/i, image: `${BASE}/durum-brochette-agneau.jpg` },
  { pattern: /durum brochettes de b[œoe]uf/i, image: `${BASE}/durum-brochette-boeuf.jpg` },
  { pattern: /durum brochettes de poulet/i, image: `${BASE}/durum-brochette-poulet.jpg` },
  { pattern: /^durum/i, image: `${BASE}/durum-shawarma.jpg` },
  { pattern: /sandwich shawarma/i, image: `${BASE}/sandwich-shawarma.jpg` },
  { pattern: /sandwich brochettes d'agneau/i, image: `${BASE}/sandwich-brochette-agneau.jpg` },
  { pattern: /sandwich brochettes de b[œoe]uf/i, image: `${BASE}/sandwich-brochette-boeuf.jpg` },
  { pattern: /sandwich brochettes de poulet/i, image: `${BASE}/sandwich-brochette-poulet.jpg` },
  { pattern: /sandwich kefta/i, image: `${BASE}/sandwich-kefta.jpg` },
  { pattern: /hamburger poulet|burger poulet/i, image: `${BASE}/hamburger-poulet.jpg` },
  { pattern: /hamburger|burger b[œoe]uf/i, image: `${BASE}/hamburger-boeuf.jpg` },
  { pattern: /filet de poulet|poulet croustillant/i, image: `${BASE}/filet-poulet.jpg` },
  { pattern: /ailes de poulet/i, image: `${BASE}/ailes-poulet.jpg` },
  { pattern: /pilon/i, image: `${BASE}/pilons-poulet.jpg` },
  { pattern: /brochettes d'agneau/i, image: `${BASE}/brochettes-agneau.jpg` },
  { pattern: /brochettes de b[œoe]uf/i, image: `${BASE}/brochettes-boeuf.png` },
  { pattern: /brochettes de kefta/i, image: `${BASE}/brochettes-kefta.jpg` },
  { pattern: /brochettes de poulet/i, image: `${BASE}/brochettes-poulet.jpg` },
  { pattern: /^falafel$/i, image: `${BASE}/falafel.jpg` },
  { pattern: /frites/i, image: `${BASE}/frites.jpg` },
  { pattern: /double expresso/i, image: `${BASE}/double-expresso.jpg` },
  { pattern: /espresso/i, image: `${BASE}/espresso.jpg` },
  { pattern: /caf[ée] syrien|cafe syrien/i, image: `${BASE}/cafe-syrien.jpg` },
  { pattern: /cappuccino/i, image: `${BASE}/cappuccino.jpg` },
  { pattern: /^caf[ée]$|^cafe$/i, image: `${BASE}/cafe.jpg` },
  { pattern: /th[ée] à la menthe|the a la menthe/i, image: `${BASE}/the-menthe.jpg` },
  { pattern: /th[ée] noir|the noir/i, image: `${BASE}/the-noir.jpg` },
  { pattern: /ayran/i, image: `${BASE}/ayran.jpg` },
  { pattern: /red bull/i, image: `${BASE}/red-bull.jpg` },
  { pattern: /coca/i, image: `${BASE}/coca.jpg` },
  { pattern: /looza/i, image: `${BASE}/looza.jpg` },
  { pattern: /tropical/i, image: `${BASE}/tropical.jpg` },
  { pattern: /uluda|gazoz/i, image: `${BASE}/uludag.jpg` },
  { pattern: /schweppes/i, image: `${BASE}/schweppes.jpg` },
  { pattern: /sprite/i, image: `${BASE}/sprite.jpg` },
  { pattern: /fanta/i, image: `${BASE}/fanta.jpg` },
  { pattern: /ice tea/i, image: `${BASE}/ice-tea.jpg` },
  { pattern: /eau p[éet]illante/i, image: `${BASE}/eau-petillante.jpg` },
  { pattern: /eau plate|^eau\b/i, image: `${BASE}/eau-plate.jpg` },
  { pattern: /harissa/i, image: `${BASE}/sauce-harissa.jpg` },
  { pattern: /ketchup curry|curry/i, image: `${BASE}/sauce-curry.jpg` },
  { pattern: /ketchup/i, image: `${BASE}/sauce-ketchup.jpg` },
  { pattern: /mayonnaise|mayo/i, image: `${BASE}/sauce-mayo.jpg` },
  { pattern: /samoura/i, image: `${BASE}/sauce-samourai.jpg` },
  { pattern: /alg[ée]rienne/i, image: `${BASE}/sauce-algerienne.jpg` },
  { pattern: /andalouse/i, image: `${BASE}/sauce-andalouse.jpg` },
  { pattern: /barbecue/i, image: `${BASE}/sauce-barbecue.jpg` },
  { pattern: /am[ée]ricaine/i, image: `${BASE}/sauce-americaine.jpg` },
  { pattern: /tartare/i, image: `${BASE}/sauce-tartare.jpg` },
  { pattern: /br[ée]silienne/i, image: `${BASE}/sauce-bresilienne.jpg` },
  { pattern: /^ail$/i, image: `${BASE}/sauce-ail.jpg` },
];

const CATEGORY_FALLBACK = {
  "entrees-froides": `${BASE}/entree-froide.jpg`,
  "entrees-chaudes": `${BASE}/entree-chaude.jpg`,
  "sandwichs-shawarmas": `${BASE}/shawarma.jpg`,
  sauces: `${BASE}/sauces.jpg`,
  plats: `${BASE}/grill-plat.jpg`,
  "boissons-chaudes": `${BASE}/cafe-hot.jpg`,
  soft: `${BASE}/boisson.jpg`,
};

/** Une seule bannière par sous-section (pas de photo par article). */
export const SUBSECTION_IMAGES = {
  Eau: `${BASE}/soft-eau.png`,
  Canette: `${BASE}/soft-canettes.png`,
  Bouteilles: `${BASE}/soft-bouteilles.png`,
};

const SUBSECTIONS_WITHOUT_ITEM_IMAGES = new Set(Object.keys(SUBSECTION_IMAGES));

function lookupExact(name) {
  const key = normalizeName(name);
  if (!key) return null;

  if (EXACT_LOOKUP[key]) return EXACT_LOOKUP[key];

  const aliasTarget = ALIAS_LOOKUP[key];
  if (aliasTarget && EXACT_LOOKUP[aliasTarget]) {
    return EXACT_LOOKUP[aliasTarget];
  }

  const lower = key.toLowerCase();
  const match = Object.entries(EXACT_LOOKUP).find(([label]) => label.toLowerCase() === lower);
  return match ? match[1] : null;
}

export function getSubsectionImage(subsectionTitle) {
  return SUBSECTION_IMAGES[subsectionTitle] || null;
}

export function getDishImage(item, category, subsectionTitle = null) {
  if (subsectionTitle && SUBSECTIONS_WITHOUT_ITEM_IMAGES.has(subsectionTitle)) {
    return null;
  }

  const platImage = item?.imageUrl?.trim();
  if (platImage && platImage.startsWith("/images/dishes/")) {
    return platImage;
  }

  const name = normalizeName(item?.name);
  if (!name) return null;

  const exact = lookupExact(name);
  if (exact) return exact;

  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(name)) return rule.image;
  }

  if (category?.id && CATEGORY_FALLBACK[category.id]) {
    return CATEGORY_FALLBACK[category.id];
  }

  return null;
}
