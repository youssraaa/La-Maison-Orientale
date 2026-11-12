/** Modes de paiement actifs (sur place / à la livraison). */
export const PAYMENT_METHODS = [
  {
    id: "ESPECES",
    label: "Espèces",
    description: "Payer en cash",
  },
  {
    id: "CARTE_SUR_PLACE",
    label: "Carte bancaire",
    description: "Terminal sur place",
  },
];

/** Perspectives d'évolution — non proposés au checkout pour l'instant. */
export const PAYMENT_METHODS_FUTURE = [
  { id: "BANCONTACT", label: "Bancontact en ligne" },
  { id: "PAYPAL", label: "PayPal" },
];

export function getPaymentMethodsForMode(mode) {
  if (mode === "LIVRAISON") {
    return [
      {
        id: "ESPECES",
        label: "Espèces",
        description: "Paiement à la livraison",
      },
    ];
  }
  return [
    {
      id: "ESPECES",
      label: "Espèces",
      description: "Paiement sur place",
    },
    {
      id: "CARTE_SUR_PLACE",
      label: "Carte bancaire",
      description: "Terminal au comptoir",
    },
  ];
}

export function getDefaultPaymentMethod(mode) {
  return "ESPECES";
}

export function normalizePaymentMethod(mode, paymentMethod) {
  const allowed = getPaymentMethodsForMode(mode);
  if (allowed.some((m) => m.id === paymentMethod)) return paymentMethod;
  return getDefaultPaymentMethod(mode);
}

export function getPaymentMethodLabel(id) {
  return (
    PAYMENT_METHODS.find((m) => m.id === id)?.label ||
    PAYMENT_METHODS_FUTURE.find((m) => m.id === id)?.label ||
    id
  );
}
