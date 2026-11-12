const SAUCE_CHOICES = [
  { id: "sans", label: "Sans sauce", price: 0 },
  { id: "ail", label: "Ail", price: 0 },
  { id: "ketchup", label: "Ketchup", price: 0 },
  { id: "mayonnaise", label: "Mayonnaise", price: 0 },
  { id: "andalouse", label: "Andalouse", price: 0 },
  { id: "barbecue", label: "Barbecue", price: 0 },
  { id: "algerienne", label: "Algérienne", price: 0 },
  { id: "samourai", label: "Samouraï", price: 0 },
  { id: "americaine", label: "Américaine", price: 0 },
  { id: "curry", label: "Ketchup curry", price: 0 },
  { id: "harissa", label: "Harissa", price: 0 },
];

const SAUCE_EXTRA_CHOICES = SAUCE_CHOICES.filter((choice) => choice.id !== "sans").map((choice) => ({
  ...choice,
  price: 1,
}));

const CRUDITES_CHOICES = [
  { id: "salade", label: "Salade", price: 0 },
  { id: "tomates", label: "Tomates", price: 0 },
  { id: "oignons", label: "Oignons", price: 0 },
  { id: "choux-rouges", label: "Choux rouges", price: 0 },
];

const SUPPLEMENT_CHOICES = [
  { id: "cheese", label: "Cheese", price: 1 },
  { id: "feta", label: "Feta", price: 1 },
  { id: "choux-rouges-supp", label: "Choux rouges", price: 1 },
  { id: "salade-russe", label: "Salade russe", price: 2.5 },
  { id: "hommos", label: "Hommos", price: 2.5 },
];

export const DISH_CUSTOMIZATION_GROUPS = [
  {
    id: "sauce",
    title: "Choix sauce",
    required: true,
    type: "radio",
    choices: SAUCE_CHOICES,
    visibleCount: 6,
  },
  {
    id: "sauce-extra",
    title: "Choix sauce supplementaire",
    required: false,
    type: "checkbox",
    choices: SAUCE_EXTRA_CHOICES,
    visibleCount: 4,
  },
  {
    id: "crudites",
    title: "Choix crudités",
    required: false,
    type: "checkbox",
    choices: CRUDITES_CHOICES,
    visibleCount: 3,
  },
  {
    id: "supplements",
    title: "Choix supplements",
    required: false,
    type: "checkbox",
    choices: SUPPLEMENT_CHOICES,
    visibleCount: 3,
  },
];

export function isCustomizableItem(item, category) {
  if (!item?.id) return false;
  const categoryId = category?.id || category?.slug;
  const name = String(item.name || "").trim();

  if (categoryId === "plats") return true;

  if (categoryId === "sandwichs-shawarmas") {
    return /^(Durum|Sandwich|Hamburger)\b/i.test(name);
  }

  return false;
}

export function buildCustomizationLineId(platId, selections) {
  const parts = Object.entries(selections)
    .flatMap(([groupId, choiceIds]) =>
      (choiceIds || []).map((choiceId) => `${groupId}:${choiceId}`)
    )
    .sort();
  return `${platId}::${parts.join("|") || "default"}`;
}

export function computeCustomizationPrice(basePrice, selections) {
  let total = Number(basePrice) || 0;
  DISH_CUSTOMIZATION_GROUPS.forEach((group) => {
    const selected = selections[group.id] || [];
    selected.forEach((choiceId) => {
      const choice = group.choices.find((entry) => entry.id === choiceId);
      if (choice) total += Number(choice.price) || 0;
    });
  });
  return total;
}

export function buildOptionsSummary(selections) {
  const parts = [];
  DISH_CUSTOMIZATION_GROUPS.forEach((group) => {
    const selected = selections[group.id] || [];
    selected.forEach((choiceId) => {
      const choice = group.choices.find((entry) => entry.id === choiceId);
      if (choice) parts.push(choice.label);
    });
  });
  return parts.join(", ");
}

export function buildSelectedOptions(selections) {
  const options = [];
  DISH_CUSTOMIZATION_GROUPS.forEach((group) => {
    (selections[group.id] || []).forEach((choiceId) => {
      const choice = group.choices.find((entry) => entry.id === choiceId);
      if (!choice) return;
      options.push({
        groupId: group.id,
        groupTitle: group.title,
        choiceId: choice.id,
        label: choice.label,
        price: Number(choice.price) || 0,
      });
    });
  });
  return options;
}

export function validateCustomizationSelections(selections) {
  const missing = DISH_CUSTOMIZATION_GROUPS.filter(
    (group) => group.required && !(selections[group.id] || []).length
  );
  return missing.length === 0 ? null : missing[0];
}

export function buildCustomizationOrderNote(items) {
  const lines = items
    .filter((item) => item.optionsSummary)
    .map((item) => `- ${item.nom} x${item.quantite}: ${item.optionsSummary}`);
  if (!lines.length) return "";
  return ["Personnalisations:", ...lines].join("\n");
}
