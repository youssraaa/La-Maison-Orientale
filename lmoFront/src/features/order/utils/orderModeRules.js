const LIVRAISON_BLOCKED = [
  /soupe.*lentille/i,
  /^grand plateau/i,
  /^1 kg grillade/i,
  /^brochettes mixte \(1 personne\)/i,
];

const EMPORTER_BLOCKED = [
  /soupe.*lentille/i,
  /^grand plateau/i,
];

function normalizeName(name) {
  return String(name || "")
    .normalize("NFC")
    .trim()
    .replace(/[\u2018\u2019\u201B`´]/g, "'")
    .replace(/œ/gi, (m) => (m === "Œ" ? "Oe" : "oe"))
    .replace(/\s+/g, " ");
}

function cartItemLabel(item) {
  return normalizeName(item?.nom || item?.name);
}

export function isAvailableForMode(name, mode) {
  const label = normalizeName(name);
  if (!label || !mode) return true;

  const rules = mode === "LIVRAISON" ? LIVRAISON_BLOCKED : EMPORTER_BLOCKED;
  return !rules.some((pattern) => pattern.test(label));
}

export function getIncompatibleCartItems(cartItems, targetMode) {
  if (!cartItems?.length) return [];
  return cartItems.filter((item) => !isAvailableForMode(cartItemLabel(item), targetMode));
}

const MODE_CHANGE_COPY = {
  LIVRAISON: {
    title: "Changement de mode de commande",
    modeLabel: "Livraison",
    warning:
      "Certains produits dans le panier ne sont pas disponibles pour une commande en livraison. Souhaitez-vous néanmoins poursuivre ?",
    confirm: "Oui, passer en livraison",
    listLabel: "Articles dans votre panier",
  },
  EMPORTER: {
    title: "Changement de mode de commande",
    modeLabel: "Emporter",
    warning:
      "Certains produits dans le panier ne sont pas disponibles pour une commande à emporter. Souhaitez-vous néanmoins poursuivre ?",
    confirm: "Oui, passer à emporter",
    listLabel: "Articles dans votre panier",
  },
};

export function getModeChangeCopy(targetMode, hasIncompatibleItems = false) {
  const base = MODE_CHANGE_COPY[targetMode] || MODE_CHANGE_COPY.EMPORTER;
  return {
    ...base,
    body: hasIncompatibleItems ? "Les articles concernés seront retirés de votre panier." : null,
  };
}
